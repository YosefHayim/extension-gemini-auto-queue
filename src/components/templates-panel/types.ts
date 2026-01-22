import type { Folder, PromptTemplate } from "@/types";

export interface TemplatesPanelProps {
  folders: Folder[];
  isDark: boolean;
  hasAIKey: boolean;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onUseTemplate: (folderId: string, templateId: string) => void;
  onDeleteTemplate: (folderId: string, templateId: string) => void;
  onSaveTemplate: (folderId: string, template: Partial<PromptTemplate>) => void;
  onImproveTemplate: (folderId: string, templateId: string) => Promise<void>;
  onImproveFolder: (folderId: string) => Promise<void>;
}

export interface DisplayedTemplate extends PromptTemplate {
  folderId: string;
  folderName: string;
}

export interface EditingTemplateState {
  folderId: string;
  template: Partial<PromptTemplate>;
}
