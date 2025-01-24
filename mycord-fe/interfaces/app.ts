export interface Server {
  id: string;
  name: string;
  icon: string;
}

export interface ServerDetail {
  id: string;
  name: string;
  icon: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  icon?: string;
  channel_id?: string;
  server_id: string;
  channels?: Channel[];
}

export enum ChannelType {
  TEXT = "text",
  VOICE = "voice",
  CATEGORY = "category",
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  channel_id: string;
  user?: User;
}

export interface MessageNotification extends Message {
  channel: Channel;
  server: Server;
}

export interface SocketEvent {
  id: string;
  name: string;
  data: any;
}
export enum BugStatus {
  REJECTED = "REJECTED",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export interface Bug {
  id: string;
  bug: string;
  status: BugStatus;
}
