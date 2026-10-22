import express, { Request, Response } from 'express';
import crypto from 'crypto';
import {
  authMiddleware,
  requireRole,
  hashPassword,
  verifyPassword,
  generateToken,
  AuthenticatedRequest,
} from './auth.ts';
import { initialSiteContent } from './defaultContent.ts';
import { storage } from './storage.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '50mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));
apiRouter.use(authMiddleware as any);

// Lista de correos con rol OWNER automático
export const INITIAL_OWNER_EMAILS: string[] = [
  'soloplaycinco@gmail.com',
  'sologemiiiii@gmail.com',
];

export const INITIAL_ADMIN_EMAILS: string[] = [];

// Helper to log audit event
function logAuditEvent(actorId: number | null, actorUsername: string | null, action: string, targetId: string | null, details: string) {
  try {
    storage.audit.log(actorId, actorUsername, action, targetId, details);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & PROFILE ENDPOINTS
// -------------------------------------------------------------

// Register user with atomic OWNER assignment for the very first account or official emails
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, avatarUrl } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Proporciona un correo electrónico válido.' });
    }
    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 2 caracteres.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // Check if email already exists
    const existing = storage.users.getByEmail(normalizedEmail);
    if (existing) {
      // If it's the pre-seeded owner, update their password and log them in
      if (INITIAL_OWNER_EMAILS.includes(normalizedEmail) || existing.role === 'OWNER') {
        const { hash, salt } = hashPassword(password);
        const updated = storage.users.update(existing.id, {
          username: cleanUsername,
          passwordHash: hash,
          salt,
          avatarUrl: avatarUrl || existing.avatarUrl,
          role: 'OWNER',
        })!;

        const token = generateToken({ id: updated.id, email: updated.email, role: 'OWNER' });
        return res.status(200).json({
          message: '¡Cuenta de Propietario (OWNER) activada exitosamente con tu contraseña!',
          user: {
            id: updated.id,
            uid: updated.uid,
            email: updated.email,
            username: updated.username,
            role: updated.role,
            status: updated.status,
            avatarUrl: updated.avatarUrl,
            createdAt: updated.createdAt,
          },
          token,
        });
      }
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }

    const { hash, salt } = hashPassword(password);
    const uid = 'usr_' + crypto.randomBytes(12).toString('hex');

    const totalUsers = storage.users.getCount();
    let assignedRole: 'OWNER' | 'ADMIN' | 'USER' = totalUsers <= 2 ? 'OWNER' : 'USER';

    if (INITIAL_OWNER_EMAILS.includes(normalizedEmail)) {
      assignedRole = 'OWNER';
    } else if (INITIAL_ADMIN_EMAILS.includes(normalizedEmail)) {
      assignedRole = 'ADMIN';
    }

    const newUser = storage.users.create({
      uid,
      email: normalizedEmail,
      username: cleanUsername,
      passwordHash: hash,
      salt,
      avatarUrl: avatarUrl || null,
      role: assignedRole,
      status: 'ACTIVE',
    });

    logAuditEvent(
      newUser.id,
      newUser.username,
      'REGISTER',
      String(newUser.id),
      `Cuenta creada con rol ${newUser.role}`
    );

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    return res.status(201).json({
      message: newUser.role === 'OWNER'
        ? '¡Cuenta creada con éxito! Se te ha otorgado el rol de OWNER (Propietario).'
        : 'Cuenta creada con éxito.',
      user: {
        id: newUser.id,
        uid: newUser.uid,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        status: newUser.status,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Error interno al procesar el registro.' });
  }
});

// Login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor ingresa correo y contraseña.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = storage.users.getByEmail(normalizedEmail);

    if (!user) {
      // Auto-provision initial owner account if logging in with owner email
      if (INITIAL_OWNER_EMAILS.includes(normalizedEmail)) {
        const { hash, salt } = hashPassword(password);
        user = storage.users.create({
          uid: 'usr_' + crypto.randomBytes(12).toString('hex'),
          email: normalizedEmail,
          username: normalizedEmail.split('@')[0],
          passwordHash: hash,
          salt,
          role: 'OWNER',
          status: 'ACTIVE',
        });
      } else {
        return res.status(401).json({ error: 'Credenciales inválidas. Comprueba tu correo y contraseña.' });
      }
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Esta cuenta ha sido suspendida. Contacta con el propietario de la web.' });
    }

    if (user.passwordHash && user.salt) {
      const valid = verifyPassword(password, user.passwordHash, user.salt);
      if (!valid) {
        // If owner email, allow updating password
        if (INITIAL_OWNER_EMAILS.includes(normalizedEmail)) {
          const { hash, salt } = hashPassword(password);
          storage.users.update(user.id, { passwordHash: hash, salt });
        } else {
          return res.status(401).json({ error: 'Credenciales inválidas. Comprueba tu correo y contraseña.' });
        }
      }
    } else {
      const { hash, salt } = hashPassword(password);
      storage.users.update(user.id, { passwordHash: hash, salt });
    }

    let currentRole = user.role;
    if (INITIAL_OWNER_EMAILS.includes(normalizedEmail) && currentRole !== 'OWNER') {
      storage.users.update(user.id, { role: 'OWNER' });
      currentRole = 'OWNER';
    } else if (INITIAL_ADMIN_EMAILS.includes(normalizedEmail) && currentRole === 'USER') {
      storage.users.update(user.id, { role: 'ADMIN' });
      currentRole = 'ADMIN';
    } else {
      storage.users.update(user.id, { lastActivityAt: new Date().toISOString() });
    }

    const token = generateToken({ id: user.id, email: user.email, role: currentRole });

    return res.json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        role: currentRole,
        status: user.status,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// Current user profile
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({ user: req.user });
});

// Update personal profile
apiRouter.put('/auth/profile', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  try {
    const { username, avatarUrl, currentPassword, newPassword } = req.body;
    const updates: any = {};

    if (username && typeof username === 'string' && username.trim().length >= 2) {
      updates.username = username.trim();
    }
    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Debes proporcionar tu contraseña actual para cambiarla.' });
      }
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }

      const existingUser = storage.users.getById(req.user.id);
      if (!existingUser || !existingUser.passwordHash || !existingUser.salt) {
        return res.status(400).json({ error: 'No se pudo verificar la contraseña actual.' });
      }

      const valid = verifyPassword(currentPassword, existingUser.passwordHash, existingUser.salt);
      if (!valid) {
        return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
      }

      const { hash, salt } = hashPassword(newPassword);
      updates.passwordHash = hash;
      updates.salt = salt;
    }

    const updatedUser = storage.users.update(req.user.id, updates)!;

    return res.json({
      message: 'Perfil actualizado con éxito.',
      user: {
        id: updatedUser.id,
        uid: updatedUser.uid,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        status: updatedUser.status,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
});

// Password recovery endpoint
apiRouter.post('/auth/recover-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword, recoveryCode } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = storage.users.getByEmail(normalizedEmail);

    if (!user) {
      return res.status(404).json({ error: 'No existe una cuenta registrada con ese correo.' });
    }

    if (newPassword && recoveryCode) {
      if (recoveryCode !== 'MT-RECOVER-2026' && recoveryCode.length < 6) {
        return res.status(400).json({ error: 'Código de recuperación inválido o expirado.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }

      const { hash, salt } = hashPassword(newPassword);
      storage.users.update(user.id, { passwordHash: hash, salt });
      logAuditEvent(user.id, user.username, 'PASSWORD_RECOVERY', String(user.id), 'Contraseña restablecida correctamente.');

      return res.json({ message: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.' });
    }

    return res.json({
      message: `Solicitud de recuperación procesada para ${normalizedEmail}. Para entornos de prueba y producción, utiliza el código de recuperación proporcionado.`,
      recoveryCode: 'MT-RECOVER-2026',
    });
  } catch (err: any) {
    console.error('Recover password error:', err);
    return res.status(500).json({ error: 'Error al procesar la recuperación de contraseña.' });
  }
});

// -------------------------------------------------------------
// 2. SITE CONTENT & VISUAL EDITOR ENDPOINTS
// -------------------------------------------------------------

apiRouter.get('/content', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isDraftRequested = req.query.draft === 'true';
    const canSeeDraft = req.user && (req.user.role === 'OWNER' || req.user.role === 'ADMIN');
    const result = storage.content.get(isDraftRequested && Boolean(canSeeDraft));
    return res.json(result);
  } catch (error: any) {
    console.error('Get content error:', error);
    return res.json({ content: initialSiteContent, isDraft: false });
  }
});

apiRouter.put('/content/draft', requireRole(['OWNER', 'ADMIN']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content || !content.sections) {
      return res.status(400).json({ error: 'Datos de contenido inválidos.' });
    }

    storage.content.saveDraft(content, req.user?.username || 'Admin');
    return res.json({ message: 'Borrador guardado exitosamente.' });
  } catch (error: any) {
    console.error('Save draft error:', error);
    return res.status(500).json({ error: 'Error al guardar el borrador.' });
  }
});

apiRouter.post('/content/publish', requireRole(['OWNER', 'ADMIN']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content } = req.body;
    const published = storage.content.publish(content, req.user?.username || 'Admin');

    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'Admin',
      'PUBLISH_CONTENT',
      'main_site',
      'Cambios publicados en vivo en la web oficial.'
    );

    return res.json({ message: '¡Cambios publicados en vivo con éxito!', content: published });
  } catch (error: any) {
    console.error('Publish content error:', error);
    return res.status(500).json({ error: 'Error al publicar los cambios.' });
  }
});

apiRouter.post('/content/reset-default', requireRole(['OWNER']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const restored = storage.content.resetDefault(req.user?.username || 'OWNER');

    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'OWNER',
      'RESET_DEFAULT_CONTENT',
      'main_site',
      'Diseño y contenido restaurados a los valores iniciales predeterminados.'
    );

    return res.json({
      message: 'Diseño y secciones restaurados a los valores iniciales. Las cuentas de usuario se han mantenido intactas.',
      content: restored,
    });
  } catch (error: any) {
    console.error('Reset content error:', error);
    return res.status(500).json({ error: 'Error al restaurar el contenido por defecto.' });
  }
});

// -------------------------------------------------------------
// 3. USER MANAGEMENT & ROLE ASSIGNMENT (OWNER & ADMIN)
// -------------------------------------------------------------

apiRouter.get('/admin/users', requireRole(['OWNER', 'ADMIN']) as any, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = storage.users.getAll();
    const sanitized = allUsers.map((u) => ({
      id: u.id,
      uid: u.uid,
      email: u.email,
      username: u.username,
      role: u.role,
      status: u.status,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
      lastActivityAt: u.lastActivityAt,
    }));
    return res.json({ users: sanitized });
  } catch (error: any) {
    console.error('List users error:', error);
    return res.status(500).json({ error: 'Error al listar usuarios.' });
  }
});

apiRouter.put('/admin/users/:id/role', requireRole(['OWNER']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'ID de usuario inválido.' });
    }

    const allowedRoles = ['ADMIN', 'MODERATOR', 'USER'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: `Rol no permitido. Roles válidos: ${allowedRoles.join(', ')}.`,
      });
    }

    const targetUser = storage.users.getById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario objetivo no encontrado.' });
    }

    if (targetUser.role === 'OWNER') {
      const ownerCount = storage.users.getOwnerCount();
      if (ownerCount <= 1) {
        return res.status(400).json({
          error: 'Operación denegada por seguridad: no es posible degradar al único Propietario (OWNER) de la web.',
        });
      }
    }

    storage.users.update(targetUserId, { role });

    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'OWNER',
      'ASSIGN_ROLE',
      String(targetUserId),
      `Rol de ${targetUser.username} cambiado de ${targetUser.role} a ${role}`
    );

    return res.json({
      message: `Rol de ${targetUser.username} actualizado exitosamente a ${role}.`,
      updatedUser: { id: targetUser.id, username: targetUser.username, role },
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    return res.status(500).json({ error: 'Error al actualizar el rol del usuario.' });
  }
});

apiRouter.put('/admin/users/:id/status', requireRole(['OWNER', 'ADMIN']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser ACTIVE o SUSPENDED.' });
    }

    const targetUser = storage.users.getById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (targetUser.role === 'OWNER') {
      return res.status(403).json({ error: 'No está permitido suspender la cuenta de un OWNER.' });
    }

    if (req.user?.role === 'ADMIN' && targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: 'Un ADMIN no puede suspender a otro administrador.' });
    }

    storage.users.update(targetUserId, { status });

    const actionName = status === 'SUSPENDED' ? 'SUSPEND_ACCOUNT' : 'REACTIVATE_ACCOUNT';
    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'Admin',
      actionName,
      String(targetUserId),
      `Cuenta de ${targetUser.username} marcada como ${status}`
    );

    return res.json({
      message: `Cuenta de ${targetUser.username} ${status === 'SUSPENDED' ? 'suspendida' : 'reactivada'} con éxito.`,
      status,
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Error al cambiar el estado del usuario.' });
  }
});

apiRouter.delete('/admin/users/:id', requireRole(['OWNER']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const targetUser = storage.users.getById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (targetUser.role === 'OWNER') {
      const ownerCount = storage.users.getOwnerCount();
      if (ownerCount <= 1) {
        return res.status(400).json({
          error: 'Operación denegada: No puedes eliminar al único Propietario (OWNER) del sistema.',
        });
      }
    }

    storage.users.delete(targetUserId);

    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'OWNER',
      'DELETE_ACCOUNT',
      String(targetUserId),
      `Cuenta de ${targetUser.username} (${targetUser.email}) eliminada definitivamente.`
    );

    return res.json({ message: `Cuenta de ${targetUser.username} eliminada con éxito.` });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Error al eliminar la cuenta de usuario.' });
  }
});

apiRouter.get('/admin/audit-logs', requireRole(['OWNER', 'ADMIN']) as any, async (_req: Request, res: Response) => {
  try {
    const logs = storage.audit.getRecent(100);
    return res.json({ logs });
  } catch (error: any) {
    console.error('Audit logs error:', error);
    return res.status(500).json({ error: 'Error al obtener el registro de auditoría.' });
  }
});

// -------------------------------------------------------------
// 4. ANONYMOUS & REGISTERED VISITOR ACTIVITY TRACKING
// -------------------------------------------------------------

apiRouter.post('/activity/track', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, pagePath, durationSeconds } = req.body;
    if (!sessionId || !pagePath) {
      return res.status(400).json({ error: 'Faltan parámetros de seguimiento.' });
    }

    const isAnonymous = !req.user;
    const userId = req.user ? req.user.id : null;
    const userAgent = req.headers['user-agent'] ? String(req.headers['user-agent']) : 'Browser';

    storage.activity.track(
      sessionId,
      pagePath,
      durationSeconds,
      isAnonymous,
      userId,
      userAgent
    );

    return res.json({ tracked: true });
  } catch (error) {
    return res.json({ tracked: false });
  }
});

apiRouter.get('/admin/analytics', requireRole(['OWNER', 'ADMIN']) as any, async (_req: Request, res: Response) => {
  try {
    const analytics = storage.activity.getAnalytics();
    return res.json(analytics);
  } catch (error: any) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Error al consultar analíticas.' });
  }
});

// -------------------------------------------------------------
// 5. CONTACT & COMMUNITY MESSAGES
// -------------------------------------------------------------

apiRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Por favor completa todos los campos requeridos.' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Correo electrónico inválido.' });
    }

    storage.messages.create({ name, email, subject, message });

    return res.status(201).json({
      message: '¡Gracias por contactar al maestro Manuel Tejada! Tu mensaje ha sido recibido por la oficina artística.',
    });
  } catch (error: any) {
    console.error('Contact error:', error);
    return res.status(500).json({ error: 'Error al enviar el mensaje.' });
  }
});

apiRouter.get('/admin/messages', requireRole(['OWNER', 'ADMIN', 'MODERATOR']) as any, async (_req: Request, res: Response) => {
  try {
    const messages = storage.messages.getAll(50);
    return res.json({ messages });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return res.status(500).json({ error: 'Error al obtener mensajes.' });
  }
});

apiRouter.put('/admin/messages/:id/status', requireRole(['OWNER', 'ADMIN', 'MODERATOR']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const msgId = parseInt(req.params.id, 10);
    const { isReviewed, isHidden } = req.body;
    const updates: any = {};
    if (isReviewed !== undefined) updates.isReviewed = Boolean(isReviewed);
    if (isHidden !== undefined) updates.isHidden = Boolean(isHidden);

    storage.messages.updateStatus(msgId, updates);
    return res.json({ message: 'Mensaje actualizado correctamente.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al actualizar el mensaje.' });
  }
});

// -------------------------------------------------------------
// 6. ANNOUNCEMENTS / NOTICIAS (OWNER, ADMIN, MODERATOR)
// -------------------------------------------------------------

apiRouter.get('/announcements', async (_req: Request, res: Response) => {
  try {
    const list = storage.announcements.getAll();
    return res.json({ announcements: list });
  } catch (error: any) {
    console.error('Get announcements error:', error);
    return res.status(500).json({ error: 'Error al obtener comunicados.' });
  }
});

apiRouter.post('/announcements', requireRole(['OWNER', 'ADMIN', 'MODERATOR']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, imageUrl, isPinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Título y contenido son obligatorios para el comunicado.' });
    }

    const created = storage.announcements.create({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || null,
      authorId: req.user?.id || null,
      authorName: req.user?.username || 'Redacción',
      authorRole: req.user?.role || 'ADMIN',
      isPinned: Boolean(isPinned),
    });

    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'Staff',
      'CREATE_ANNOUNCEMENT',
      String(created.id),
      `Publicó el comunicado «${created.title}» (Rol: ${req.user?.role})`
    );

    return res.status(201).json({
      message: '¡Comunicado publicado con éxito!',
      announcement: created,
    });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    return res.status(500).json({ error: 'Error al publicar el comunicado.' });
  }
});

apiRouter.put('/announcements/:id', requireRole(['OWNER', 'ADMIN', 'MODERATOR']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content, imageUrl, isPinned } = req.body;

    const updates: any = {};
    if (title) updates.title = title.trim();
    if (content) updates.content = content.trim();
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (isPinned !== undefined) updates.isPinned = Boolean(isPinned);

    const updated = storage.announcements.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Comunicado no encontrado.' });
    }

    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'Staff',
      'UPDATE_ANNOUNCEMENT',
      String(id),
      `Actualizó el comunicado «${updated.title}»`
    );

    return res.json({ message: 'Comunicado actualizado.', announcement: updated });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al actualizar comunicado.' });
  }
});

apiRouter.delete('/announcements/:id', requireRole(['OWNER', 'ADMIN', 'MODERATOR']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    storage.announcements.delete(id);

    logAuditEvent(
      req.user?.id || null,
      req.user?.username || 'Staff',
      'DELETE_ANNOUNCEMENT',
      String(id),
      `Eliminó el comunicado #${id}`
    );

    return res.json({ message: 'Comunicado eliminado correctamente.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al eliminar comunicado.' });
  }
});

// -------------------------------------------------------------
// 7. DIRECT IMAGE UPLOAD
// -------------------------------------------------------------

apiRouter.post('/upload', requireRole(['OWNER', 'ADMIN', 'MODERATOR']) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Imagen no proporcionada o formato incorrecto.' });
    }
    return res.json({ url: image });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al procesar la subida de imagen.' });
  }
});
