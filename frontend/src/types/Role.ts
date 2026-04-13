export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; username: string } | string;
  updatedBy: { _id: string; username: string } | string;
  _id: string;
}
