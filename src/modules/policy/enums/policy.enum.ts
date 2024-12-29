export enum ENUM_POLICY_ACTION {
    MANAGE = 'manage',
    READ = 'read',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    EXPORT = 'export',
    IMPORT = 'import',
}

export enum ENUM_POLICY_REQUEST_ACTION {
    MANAGE,
    READ,
    CREATE,
    UPDATE,
    DELETE,
    EXPORT,
    IMPORT,
}

export enum ENUM_POLICY_SUBJECT {
    ALL = 'ALL',
    AUTH = 'AUTH',
    API_KEY = 'API_KEY',
    SETTING = 'SETTING',
    COUNTRY = 'COUNTRY',
    CATEGORY = 'CATEGORY',
    ROLE = 'ROLE',
    USER = 'USER',
    EXPERT = 'EXPERT',
    EVENT = 'EVENT',
    SCHEDULE = 'SCHEDULE',
    SLOT = 'SLOT',
    BOOKING = 'BOOKING',
    MEETING = 'MEETING',
    MEETING_CALL = 'MEETING_CALL',
    MEETING_USER = 'MEETING_USER',
    STREAM_ASYNC_TASK = 'STREAM_ASYNC_TASK',
}

export enum ENUM_POLICY_ROLE_TYPE {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    USER = 'USER',
    EXPERT = 'EXPERT',
}
