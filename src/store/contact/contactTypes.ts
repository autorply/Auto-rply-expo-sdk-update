import { Conversation } from '@/types';
import { Contact } from '@/types/Contact';
export interface ContactLabelsAPIResponse {
  payload: string[];
}

export interface ContactLabelsPayload {
  contactId: number;
}

export interface UpdateContactLabelsPayload {
  contactId: number;
  labels: string[];
}

export interface ContactConversationPayload {
  contactId: number;
}

export interface ContactConversationAPIResponse {
  payload: Conversation[];
}

export interface ContactsListPayload {
  page?: number;
}

export interface ContactsListMeta {
  count: number;
  current_page: number;
}

export interface ContactsListAPIResponse {
  meta: ContactsListMeta;
  payload: Contact[];
}
