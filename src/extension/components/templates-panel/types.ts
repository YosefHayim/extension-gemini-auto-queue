import type { Folder, PromptTemplate } from "@/backend/types";

export interface TemplatesPanelProps {
  folders: Folder[];
  isDark: boolean;
  hasAIKey: boolean;
  onCreateFolder: (name: string, color?: string, icon?: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onUseTemplate: (folderId: string, templateId: string) => void;
  onDeleteTemplate: (folderId: string, templateId: string) => void;
  onSaveTemplate: (folderId: string, template: Partial<PromptTemplate>) => void;
  onImproveTemplate: (folderId: string, templateId: string) => Promise<void>;
  onImproveFolder: (folderId: string) => Promise<void>;
  onUpdateFolder?: (folderId: string, name: string, color?: string, icon?: string) => void;
}

export interface DisplayedTemplate extends PromptTemplate {
  folderId: string;
  folderName: string;
}

export interface EditingTemplateState {
  folderId: string;
  template: Partial<PromptTemplate>;
}
