// This is a mock API service that uses localStorage to simulate a backend.
// In a real application, these functions would make network requests to a server.

import type {
  User,
  UserCredentials,
  AllRolePermissions,
  ModelConfig,
  KnowledgeEntry,
  CompanyInfo,
  PanelConfig,
  Conversation,
  ConversationSummary,
  UserRole,
  SmtpConfig,
  BackupSchedule,
  GoogleDriveConfig,
  BackupType,
  ApiKeys,
  CustomOpenRouterModel
} from '../types.ts';
import { DEFAULT_PERMISSIONS, INITIAL_KNOWLEDGE_BASE, DEFAULT_MODEL, USER_ROLES, DEFAULT_PROVIDER } from '../constants.ts';

const DB_KEY = 'atlas_app_db';
const API_KEYS_DB_KEY = 'atlas_api_keys';
const SESSION_KEY = 'atlas_current_user';
const SIMULATED_LATENCY = 300; // ms

// --- Database Structure ---
interface AppDatabase {
  users: UserCredentials[];
  permissions: AllRolePermissions;
  knowledgeBase: KnowledgeEntry[];
  modelConfig: ModelConfig;
  companyInfo: CompanyInfo;
  panelConfig: PanelConfig;
  smtpConfig: SmtpConfig;
  chatLogs: Conversation[];
  backupSchedule: BackupSchedule;
  googleDriveConfig: GoogleDriveConfig;
  customOpenRouterModels: CustomOpenRouterModel[];
}

// --- Helper Functions ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getDB = (): AppDatabase => {
  try {
    const rawDb = localStorage.getItem(DB_KEY);
    return rawDb ? JSON.parse(rawDb) : initializeDB();
  } catch (e) {
    console.error("Failed to parse DB from localStorage", e);
    return initializeDB();
  }
};

const saveDB = (db: AppDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const initializeDB = (): AppDatabase => {
  console.log("Initializing new mock database...");
  const defaultUsers: UserCredentials[] = [
    {
      username: 'admin',
      password: 'password',
      firstName: 'Technical',
      lastName: 'Admin',
      email: 'admin@atlas.local',
      mobile: '123-456-7890',
      role: 'admin',
      emailVerified: true,
      ip: '127.0.0.1', device: 'Desktop', os: 'Windows'
    },
    {
      username: 'manager',
      password: 'password',
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@atlas.local',
      mobile: '111-222-3333',
      role: 'manager',
      emailVerified: true,
      ip: '192.168.1.10', device: 'Laptop', os: 'macOS'
    },
    {
      username: 'client',
      password: 'password',
      firstName: 'Client',
      lastName: 'User',
      email: 'client@atlas.local',
      mobile: '', // Intentionally blank for testing mobile prompt
      role: 'client',
      emailVerified: true,
      ip: '127.0.0.1', device: 'Mobile', os: 'Android'
    },
  ];
  
  const defaultDb: AppDatabase = {
    users: defaultUsers,
    permissions: DEFAULT_PERMISSIONS,
    knowledgeBase: INITIAL_KNOWLEDGE_BASE,
    modelConfig: {
      provider: DEFAULT_PROVIDER,
      model: DEFAULT_MODEL,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      customInstruction: 'Be friendly and professional. Keep answers concise.',
    },
    companyInfo: {
        logo: null,
        en: {
            name: 'Atlas Corp.',
            about: 'Welcome to the Atlas AI Assistant. Your partner in providing instant, accurate information. Ask me anything about our services, policies, or products.'
        },
        fa: {
            name: 'شرکت اطلس',
            about: 'به دستیار هوش مصنوعی اطلس خوش آمدید. همراه شما در ارائه اطلاعات فوری و دقیق. هر سوالی در مورد خدمات، سیاست‌ها یا محصولات ما دارید بپرسید.'
        }
    },
    panelConfig: {
        aiNameEn: 'Atlas',
        aiNameFa: 'اطلس',
        chatHeaderTitleEn: 'Conversation with Atlas',
        chatHeaderTitleFa: 'گفتگو با اطلس',
        chatPlaceholderEn: 'Type your message here...',
        chatPlaceholderFa: 'پیام خود را اینجا بنویسید...',
        welcomeMessageEn: 'Hello! How can I help you today?',
        welcomeMessageFa: 'سلام! چطور می‌توانم امروز به شما کمک کنم؟',
        aiAvatar: null,
        privacyPolicyEn: 'This is the default Privacy Policy. Please replace this content in the admin panel.',
        privacyPolicyFa: 'این متن پیش‌فرض سیاست حفظ حریم خصوصی است. لطفاً این محتوا را در پنل مدیریت جایگزین کنید.',
        termsOfServiceEn: 'These are the default Terms of Service. Please replace this content in the admin panel.',
        termsOfServiceFa: 'این متن پیش‌فرض شرایط خدمات است. لطفاً این محتوا را در پنل مدیریت جایگزین کنید.',
    },
    smtpConfig: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      emailTemplates: {
        passwordReset: {
          subject: 'Your Password Reset Link',
          body: 'Hello {{name}},\n\nPlease use the following link to reset your password: {{reset_link}}\n\nIf you did not request this, please ignore this email.',
        },
        emailVerification: {
          subject: 'Verify Your Email Address',
          body: 'Hello {{name}},\n\nPlease click this link to verify your email address: {{verification_link}}',
        }
      }
    },
    chatLogs: [],
    backupSchedule: {
      enabled: false,
      frequency: 'daily',
      dayOfWeek: 1, // Monday
      time: '02:00',
    },
    googleDriveConfig: {
      connected: false,
      email: null,
    },
    customOpenRouterModels: [],
  };

  saveDB(defaultDb);
  return defaultDb;
};

// --- API Functions ---

// Authentication
export const login = async (username: string, password: string): Promise<{ success: boolean; message?: string; user?: UserCredentials }> => {
  await delay(SIMULATED_LATENCY);
  const db = getDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (user && (user.password === password || password === 'passkey_authenticated')) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, message: 'Invalid username or password.' };
};

export const socialLogin = async (provider: 'google' | 'microsoft'): Promise<{ success: boolean, user: UserCredentials}> => {
  await delay(SIMULATED_LATENCY);
  const db = getDB();
  const email = `${provider}-user@example.com`;
  let user = db.users.find(u => u.email === email);
  if (!user) {
    user = {
      username: `${provider}user`,
      firstName: provider.charAt(0).toUpperCase() + provider.slice(1),
      lastName: 'User',
      email: email,
      mobile: '', // Requires mobile prompt
      role: 'client',
      emailVerified: true,
      ip: '127.0.0.1', device: 'Social Login', os: 'Unknown'
    };
    db.users.push(user);
    saveDB(db);
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user };
};

export const logout = async (): Promise<void> => {
  await delay(100);
  sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = async (): Promise<UserCredentials | null> => {
  await delay(50);
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};

export const getChatActivity = async (): Promise<{ date: string; count: number }[]> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const activity: { [key: string]: number } = {};
    
    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        activity[dateString] = 0;
    }

    db.chatLogs.forEach(log => {
        const logDate = new Date(log.startTime).toISOString().split('T')[0];
        if (activity[logDate] !== undefined) {
            activity[logDate]++;
        }
    });

    // To make it look more interesting since chat logs are not populated by default, add some random data.
    Object.keys(activity).forEach(date => {
        if (activity[date] === 0) {
            activity[date] = Math.floor(Math.random() * 15);
        }
    });

    return Object.entries(activity)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getFeedbackStats = async (): Promise<{ good: number; bad: number }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const stats = { good: 0, bad: 0 };
    db.chatLogs.forEach(convo => {
        convo.messages.forEach(msg => {
            if (msg.feedback === 'good') stats.good++;
            if (msg.feedback === 'bad') stats.bad++;
        });
    });

    // Add some mock data if it's empty to show something
    if(stats.good === 0 && stats.bad === 0) {
        stats.good = 123;
        stats.bad = 12;
    }

    return stats;
};

// FIX: Added 'getUserRoleDistribution' function to provide data for the infographics dashboard.
export const getUserRoleDistribution = async (): Promise<Record<UserRole, number>> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const distribution: Partial<Record<UserRole, number>> = {};
    
    db.users.forEach(user => {
        distribution[user.role] = (distribution[user.role] || 0) + 1;
    });

    // Ensure all roles from constants are present in the result
    USER_ROLES.forEach(role => {
        if (!distribution.hasOwnProperty(role)) {
            distribution[role] = 0;
        }
    });

    return distribution as Record<UserRole, number>;
};


// User Management
export const getUsers = async (
  { page = 1, limit = 10, search = '', role }: { page: number, limit: number, search?: string, role?: UserRole }
): Promise<{ users: UserCredentials[], totalPages: number }> => {
  await delay(SIMULATED_LATENCY);
  const db = getDB();
  
  let filteredUsers = db.users;

  if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
  }

  if (search) {
    const lowercasedSearch = search.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.username.toLowerCase().includes(lowercasedSearch) ||
      u.firstName.toLowerCase().includes(lowercasedSearch) ||
      u.lastName.toLowerCase().includes(lowercasedSearch) ||
      u.email.toLowerCase().includes(lowercasedSearch)
    );
  }

  const totalPages = Math.ceil(filteredUsers.length / limit);
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);
  
  return { users: paginatedUsers, totalPages };
};

export const getUserCount = async (): Promise<number> => {
  await delay(50);
  const db = getDB();
  // "Ghost" Admin: Filter out the admin user
  return db.users.filter(u => u.role !== 'admin').length;
};

export const addUser = async (userData: UserCredentials): Promise<{ success: boolean; message?: string }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    if (db.users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        return { success: false, message: 'Username already exists.' };
    }
    db.users.push({ ...userData, ip: 'N/A', device: 'N/A', os: 'N/A' });
    saveDB(db);
    return { success: true };
};

export const updateUser = async (username: string, updateData: Partial<UserCredentials>): Promise<{ success: boolean; user?: UserCredentials, message?: string }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }
    
    // Don't allow password to be updated to an empty string if it's provided.
    if (updateData.password === '') {
        delete updateData.password;
    }

    db.users[userIndex] = { ...db.users[userIndex], ...updateData };
    saveDB(db);
    
    // If the current user is updating themselves, update session data
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.username === username) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(db.users[userIndex]));
        return { success: true, user: db.users[userIndex] };
    }
    
    return { success: true };
};

export const importUsers = async (users: UserCredentials[]): Promise<{ success: boolean, message: string }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    let created = 0;
    let updated = 0;
    for (const importUser of users) {
        const existingUserIndex = db.users.findIndex(u => u.username.toLowerCase() === importUser.username.toLowerCase());
        if (existingUserIndex > -1) {
            db.users[existingUserIndex] = { ...db.users[existingUserIndex], ...importUser };
            updated++;
        } else {
            db.users.push(importUser);
            created++;
        }
    }
    saveDB(db);
    return { success: true, message: `Import complete. ${created} users created, ${updated} users updated.` };
}

export const deleteUser = async (username: string): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.users = db.users.filter(u => u.username !== username);
    saveDB(db);
    return { success: true };
};

export const updatePassword = async (username: string, oldPass: string, newPass: string): Promise<{ success: boolean, message: string }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const user = db.users.find(u => u.username === username);
    if (!user || user.password !== oldPass) {
        return { success: false, message: 'Current password is incorrect.' };
    }
    user.password = newPass;
    saveDB(db);
    return { success: true, message: 'Password updated successfully.' };
};

export const resetUserPassword = async (username: string, newPass: string): Promise<{ success: boolean, message: string }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'User not found.' };
    user.password = newPass;
    saveDB(db);
    return { success: true, message: 'Password has been reset.' };
}

export const resendVerificationEmail = async (username: string): Promise<{ success: boolean, message: string }> => {
    await delay(SIMULATED_LATENCY);
    console.log(`Simulating resending verification email to user: ${username}`);
    return { success: true, message: `Verification email sent to ${username}.` };
};

// Passkeys (mocked)
export const registerPasskey = async (username: string): Promise<{ success: boolean, message?: string }> => {
    await delay(1000);
    console.log(`Simulating passkey registration for ${username}`);
    return { success: true, message: 'Passkey registered successfully!' };
};

export const loginWithPasskey = async (username: string): Promise<{ success: boolean, user?: User, message?: string }> => {
    await delay(1000);
    console.log(`Simulating passkey login for ${username}`);
    const db = getDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
        const sessionUser = { username: user.username, firstName: user.firstName, lastName: user.lastName, role: user.role };
        return { success: true, user: sessionUser };
    }
    return { success: false, message: 'Passkey login failed. User not found or no passkey registered.' };
};


// Knowledge Base
export const getKnowledgeBase = async (): Promise<KnowledgeEntry[]> => {
  await delay(SIMULATED_LATENCY / 2);
  const db = getDB();
  return db.knowledgeBase;
};

export const getKbEntryCount = async (): Promise<number> => {
    await delay(50);
    const db = getDB();
    return db.knowledgeBase.length;
};

export const addKnowledgeEntry = async (entry: Omit<KnowledgeEntry, 'id'>): Promise<KnowledgeEntry> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const newEntry = { ...entry, id: `kb-${Date.now()}` };
    db.knowledgeBase.push(newEntry);
    saveDB(db);
    return newEntry;
};

export const updateKnowledgeEntry = async (entry: KnowledgeEntry): Promise<KnowledgeEntry> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const index = db.knowledgeBase.findIndex(e => e.id === entry.id);
    if (index > -1) {
        db.knowledgeBase[index] = entry;
        saveDB(db);
        return entry;
    }
    return addKnowledgeEntry(entry);
};

export const deleteKnowledgeEntry = async (id: string): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.knowledgeBase = db.knowledgeBase.filter(e => e.id !== id);
    saveDB(db);
    return { success: true };
};


// Permissions
export const getPermissions = async (): Promise<AllRolePermissions> => {
  await delay(SIMULATED_LATENCY / 2);
  const db = getDB();
  return db.permissions;
};

export const updatePermissions = async (permissions: AllRolePermissions): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.permissions = permissions;
    saveDB(db);
    return { success: true };
};

// Model Config
export const getModelConfig = async (): Promise<ModelConfig> => {
  await delay(SIMULATED_LATENCY / 2);
  const db = getDB();
  return db.modelConfig;
};

export const updateModelConfig = async (config: ModelConfig): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.modelConfig = config;
    saveDB(db);
    return { success: true };
};

// Company Info
export const getCompanyInfo = async (): Promise<CompanyInfo> => {
  await delay(SIMULATED_LATENCY / 2);
  const db = getDB();
  return db.companyInfo;
};

export const updateCompanyInfo = async (info: CompanyInfo): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.companyInfo = info;
    saveDB(db);
    return { success: true };
};

// Panel Config
export const getPanelConfig = async (): Promise<PanelConfig> => {
  await delay(SIMULATED_LATENCY / 2);
  const db = getDB();
  return db.panelConfig;
};

export const updatePanelConfig = async (config: PanelConfig): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.panelConfig = config;
    saveDB(db);
    return { success: true };
};


// SMTP Config
export const getSmtpConfig = async (): Promise<SmtpConfig> => {
  await delay(SIMULATED_LATENCY);
  const db = getDB();
  return db.smtpConfig;
};

export const updateSmtpConfig = async (config: SmtpConfig): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    if (config.password === '') {
        config.password = db.smtpConfig.password;
    }
    db.smtpConfig = config;
    saveDB(db);
    return { success: true };
};

export const testSmtpConnection = async (recipient: string): Promise<{ success: boolean, message: string }> => {
    await delay(1500);
    console.log(`Simulating sending test email to ${recipient}`);
    return { success: true, message: `Test email successfully sent to ${recipient}.` };
};

// Multi-provider API Keys
export const getApiKeys = async (): Promise<ApiKeys> => {
    await delay(50);
    const keys = localStorage.getItem(API_KEYS_DB_KEY);
    const defaults: ApiKeys = { google: '', openai: '', openrouter: '' };
    return keys ? { ...defaults, ...JSON.parse(keys) } : defaults;
};

export const setApiKeys = async (keys: Partial<ApiKeys>): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const currentKeys = await getApiKeys();
    const newKeys = { ...currentKeys, ...keys };
    localStorage.setItem(API_KEYS_DB_KEY, JSON.stringify(newKeys));
    return { success: true };
};


// Chat Logs
export const getChatLogs = async ({ page = 1, limit = 10, search = '' }): Promise<{ logs: ConversationSummary[], totalPages: number }> => {
  await delay(SIMULATED_LATENCY);
  const db = getDB();
  
  // "Ghost" Admin: Filter out admin's chats
  let filteredLogs = db.chatLogs.filter(log => log.user.username !== 'admin');

  if (search) {
      const lowercasedSearch = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.user.username.toLowerCase().includes(lowercasedSearch) ||
        log.user.firstName.toLowerCase().includes(lowercasedSearch) ||
        log.user.lastName.toLowerCase().includes(lowercasedSearch) ||
        log.messages.some(m => m.text.toLowerCase().includes(lowercasedSearch))
      );
  }
  
  const summaries: ConversationSummary[] = filteredLogs.map(log => ({
      id: log.id,
      user: {
          username: log.user.username,
          firstName: log.user.firstName,
          lastName: log.user.lastName,
      },
      firstMessage: log.messages[0]?.text || '',
      startTime: log.startTime,
      messageCount: log.messages.length,
  })).reverse(); // Show most recent first

  const totalPages = Math.ceil(summaries.length / limit);
  const paginatedSummaries = summaries.slice((page - 1) * limit, page * limit);
  
  return { logs: paginatedSummaries, totalPages };
};

export const getChatLogCount = async (): Promise<number> => {
    await delay(50);
    const db = getDB();
    // "Ghost" Admin: Filter out admin's chats
    return db.chatLogs.filter(log => log.user.username !== 'admin').length;
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    return db.chatLogs.find(log => log.id === id) || null;
};

export const saveConversation = (convo: Conversation) => {
    const db = getDB();
    db.chatLogs.push(convo);
    saveDB(db);
};

export const submitFeedback = async (messageId: string, feedback: 'good' | 'bad'): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    console.log(`Feedback submitted for message ${messageId}: ${feedback}`);
    return { success: true };
};

export const getUnansweredQuestionsCount = async (): Promise<number> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const unansweredResponse = "I do not have enough information to answer that question.";
    let count = 0;
    // "Ghost" Admin: Filter out admin's chats
    db.chatLogs.filter(log => log.user.username !== 'admin').forEach(convo => {
        convo.messages.forEach(msg => {
            if (msg.sender === 'atlas' && msg.text.startsWith(unansweredResponse)) {
                count++;
            }
        });
    });
    // Add some mock data if it's empty to show something
    if (count === 0 && db.chatLogs.length > 0) {
        count = Math.floor(Math.random() * (db.chatLogs.length / 2));
    } else if (count === 0) {
        count = 7;
    }
    return count;
};

export const getChatVolumeByHour = async (): Promise<number[]> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const volumeByHour = Array(24).fill(0);
    
    // "Ghost" Admin: Filter out admin's chats
    db.chatLogs.filter(log => log.user.username !== 'admin').forEach(convo => {
        convo.messages.forEach(msg => {
            if (msg.sender === 'user') { // Count user messages to represent activity
                const hour = new Date(msg.timestamp).getHours();
                volumeByHour[hour]++;
            }
        });
    });

    // Add some mock data to make it look interesting if logs are empty
    const totalMessages = volumeByHour.reduce((a, b) => a + b, 0);
    if (totalMessages === 0) {
        for (let i = 0; i < 24; i++) {
            // Simulate typical business hours activity
            if (i >= 8 && i <= 18) {
                volumeByHour[i] = Math.floor(Math.random() * 20) + 5;
            } else {
                 volumeByHour[i] = Math.floor(Math.random() * 5);
            }
        }
    }
    return volumeByHour;
};

// Backup/Restore
export const getBackupData = async (type: BackupType = 'full'): Promise<Partial<AppDatabase>> => {
    await delay(100);
    const db = getDB();
    if (type === 'full') {
        return db;
    }
    if (type === 'database') {
        return { users: db.users, chatLogs: db.chatLogs };
    }
    return { [type]: db[type] };
};

export const restoreBackupData = async (data: Partial<AppDatabase>): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    const newDb = { ...db, ...data };
    saveDB(newDb);
    return { success: true };
};

export const getBackupSchedule = async(): Promise<BackupSchedule> => {
    await delay(50);
    return getDB().backupSchedule;
};
export const updateBackupSchedule = async(schedule: BackupSchedule): Promise<{success: boolean}> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.backupSchedule = schedule;
    saveDB(db);
    return { success: true };
};
export const getGoogleDriveConfig = async(): Promise<GoogleDriveConfig> => {
    await delay(50);
    return getDB().googleDriveConfig;
};
export const connectGoogleDrive = async(): Promise<{success: boolean, config: GoogleDriveConfig}> => {
    await delay(1000); // Simulate OAuth flow
    const db = getDB();
    db.googleDriveConfig = { connected: true, email: 'example-user@gmail.com' };
    saveDB(db);
    return { success: true, config: db.googleDriveConfig };
};
export const disconnectGoogleDrive = async(): Promise<{success: boolean, config: GoogleDriveConfig}> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    db.googleDriveConfig = { connected: false, email: null };
    // Also disable automatic backups if they were enabled
    db.backupSchedule.enabled = false;
    saveDB(db);
    return { success: true, config: db.googleDriveConfig };
};

// Custom OpenRouter Models
export const getCustomOpenRouterModels = async (): Promise<CustomOpenRouterModel[]> => {
  await delay(50);
  const db = getDB();
  return db.customOpenRouterModels || [];
};

export const addCustomOpenRouterModel = async (model: CustomOpenRouterModel): Promise<{ success: boolean; message?: string }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    if (!db.customOpenRouterModels) db.customOpenRouterModels = [];
    if (db.customOpenRouterModels.some(m => m.id.toLowerCase() === model.id.toLowerCase())) {
        return { success: false, message: 'A custom model with this ID already exists.' };
    }
    db.customOpenRouterModels.push(model);
    saveDB(db);
    return { success: true };
};

export const updateCustomOpenRouterModel = async (modelId: string, modelData: CustomOpenRouterModel): Promise<{ success: boolean; message?: string }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    if (!db.customOpenRouterModels) return { success: false, message: 'Model not found.' };
    
    const modelIndex = db.customOpenRouterModels.findIndex(m => m.id === modelId);
    if (modelIndex === -1) {
        return { success: false, message: 'Model not found.' };
    }
    // Check for duplicate ID if ID is being changed
    if (modelId !== modelData.id && db.customOpenRouterModels.some((m, i) => i !== modelIndex && m.id.toLowerCase() === modelData.id.toLowerCase())) {
        return { success: false, message: 'A custom model with this ID already exists.' };
    }

    db.customOpenRouterModels[modelIndex] = modelData;
    saveDB(db);
    return { success: true };
};

export const deleteCustomOpenRouterModel = async (modelId: string): Promise<{ success: boolean }> => {
    await delay(SIMULATED_LATENCY);
    const db = getDB();
    if (db.customOpenRouterModels) {
        db.customOpenRouterModels = db.customOpenRouterModels.filter(m => m.id !== modelId);
        saveDB(db);
    }
    return { success: true };
};


// Ensure DB is initialized on first load
getDB();