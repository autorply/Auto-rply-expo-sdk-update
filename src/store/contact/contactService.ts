import { apiService } from '@/services/APIService';
import type {
  ContactLabelsAPIResponse,
  ContactLabelsPayload,
  UpdateContactLabelsPayload,
  ContactConversationAPIResponse,
  ContactConversationPayload,
  ContactsListAPIResponse,
  ContactsListPayload,
} from './contactTypes';
import { transformContact, transformConversation } from '@/utils/camelCaseKeys';

export class ContactService {
  static async getContacts(payload: ContactsListPayload = {}): Promise<ContactsListAPIResponse> {
    const { page = 1 } = payload;
    const response = await apiService.get<ContactsListAPIResponse>(`contacts?page=${page}`);
    const transformedContacts = response.data.payload.map(transformContact);
    return {
      ...response.data,
      payload: transformedContacts,
    };
  }

  static async getContactLabels(payload: ContactLabelsPayload) {
    const { contactId } = payload;
    const response = await apiService.get<ContactLabelsAPIResponse>(`contacts/${contactId}/labels`);
    return response.data;
  }

  static async updateContactLabels(
    payload: UpdateContactLabelsPayload,
  ): Promise<ContactLabelsAPIResponse> {
    const { contactId, labels } = payload;
    const response = await apiService.post<ContactLabelsAPIResponse>(
      `contacts/${contactId}/labels`,
      { labels },
    );
    return response.data;
  }

  static async getContactConversations(
    payload: ContactConversationPayload,
  ): Promise<ContactConversationAPIResponse> {
    const { contactId } = payload;
    const response = await apiService.get<ContactConversationAPIResponse>(
      `contacts/${contactId}/conversations`,
    );
    const transformedResponse = response.data.payload.map(transformConversation);
    return {
      payload: transformedResponse,
    };
  }
}
