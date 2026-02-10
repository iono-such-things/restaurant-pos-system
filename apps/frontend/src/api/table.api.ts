import { Table, TableStatus } from '../types/table.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const tableApi = {
  async getTables(floorPlanId: string): Promise<Table[]> {
    const response = await fetch(`${API_BASE_URL}/api/tables?floorPlanId=${floorPlanId}`);
    if (!response.ok) throw new Error('Failed to fetch tables');
    return response.json();
  },

  async getTable(id: string): Promise<Table> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`);
    if (!response.ok) throw new Error('Failed to fetch table');
    return response.json();
  },

  async createTable(data: Partial<Table>): Promise<Table> {
    const response = await fetch(`${API_BASE_URL}/api/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create table');
    return response.json();
  },

  async updateTable(id: string, data: Partial<Table>): Promise<Table> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update table');
    return response.json();
  },

  async updateTableStatus(id: string, status: TableStatus): Promise<Table> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update table status');
    return response.json();
  },

  async deleteTable(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete table');
  },
};