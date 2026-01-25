import { useMemo, useState } from "react";

import type { Folder, PromptTemplate } from "@/backend/types";
import type {
  DisplayedTemplate,
  EditingTemplateState,
} from "@/extension/components/templates-panel/types";

interface UseTemplatesPanelParams {
  folders: Folder[];
  onCreateFolder: (name: string, color?: string, icon?: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteTemplate: (folderId: string, templateId: string) => void;
  onSaveTemplate: (folderId: string, template: Partial<PromptTemplate>) => void;
  onImproveTemplate: (folderId: string, templateId: string) => Promise<void>;
  onImproveFolder: (folderId: string) => Promise<void>;
  onUpdateFolder?: (folderId: string, name: string, color?: string, icon?: string) => void;
}

export function useTemplatesPanel({
  folders,
  onCreateFolder,
  onDeleteFolder,
  onDeleteTemplate,
  onSaveTemplate,
  onImproveTemplate,
  onImproveFolder,
  onUpdateFolder,
}: UseTemplatesPanelParams) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [improvingIds, setImprovingIds] = useState<Set<string>>(new Set());
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplateState | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const displayedTemplates = useMemo<DisplayedTemplate[]>(() => {
    if (selectedFolderId === null) {
      return folders.flatMap((folder) =>
        folder.templates.map((template) => ({
          ...template,
          folderId: folder.id,
          folderName: folder.name,
        }))
      );
    }
    const folder = folders.find((f) => f.id === selectedFolderId);
    return (
      folder?.templates.map((template) => ({
        ...template,
        folderId: folder.id,
        folderName: folder.name,
      })) ?? []
    );
  }, [folders, selectedFolderId]);

  const handleCreateFolder = (color?: string, icon?: string) => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), color, icon);
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete folder and all templates inside?")) return;
    onDeleteFolder(id);
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  };

  const handleDeleteTemplate = (folderId: string, templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this template?")) return;
    onDeleteTemplate(folderId, templateId);
  };

  const handleStartTemplateEdit = (folderId: string, templateId?: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (templateId) {
      const folder = folders.find((f) => f.id === folderId);
      const template = folder?.templates.find((t) => t.id === templateId);
      if (template) setEditingTemplate({ folderId, template: { ...template } });
    } else {
      const newTemplate: Partial<PromptTemplate> = {
        id: Math.random().toString(36).substring(2, 9),
        name: "",
        text: "",
        createdAt: Date.now(),
        lastEditedAt: Date.now(),
        timesUsed: 0,
        images: [],
      };
      setEditingTemplate({ folderId, template: newTemplate });
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate?.template.name) return;
    onSaveTemplate(editingTemplate.folderId, editingTemplate.template);
    setEditingTemplate(null);
  };

  const handleImproveTemplate = async (
    folderId: string,
    templateId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setImprovingIds((prev) => new Set(prev).add(templateId));
    try {
      await onImproveTemplate(folderId, templateId);
    } finally {
      setImprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    }
  };

  const handleImproveFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    const idsToImprove = folder.templates.map((t) => t.id);
    setImprovingIds((prev) => new Set([...Array.from(prev), ...idsToImprove, folderId]));

    try {
      await onImproveFolder(folderId);
    } finally {
      setImprovingIds((prev) => {
        const next = new Set(prev);
        idsToImprove.forEach((id) => next.delete(id));
        next.delete(folderId);
        return next;
      });
    }
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setIsCreatingFolder(true);
  };

  const handleUpdateFolder = (folderId: string, name: string, color?: string, icon?: string) => {
    if (!name.trim()) return;
    onUpdateFolder?.(folderId, name.trim(), color, icon);
    setEditingFolder(null);
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleCloseDialog = () => {
    setIsCreatingFolder(false);
    setEditingFolder(null);
    setNewFolderName("");
  };

  const totalTemplateCount = folders.reduce((sum, f) => sum + f.templates.length, 0);
  const selectedFolder = selectedFolderId ? folders.find((f) => f.id === selectedFolderId) : null;
  const isImprovingFolder = selectedFolderId ? improvingIds.has(selectedFolderId) : false;

  return {
    isCreatingFolder,
    setIsCreatingFolder,
    newFolderName,
    setNewFolderName,
    improvingIds,
    editingTemplate,
    setEditingTemplate,
    selectedFolderId,
    setSelectedFolderId,
    editingFolder,
    displayedTemplates,
    totalTemplateCount,
    selectedFolder,
    isImprovingFolder,
    handleCreateFolder,
    handleDeleteFolder,
    handleDeleteTemplate,
    handleStartTemplateEdit,
    handleSaveTemplate,
    handleImproveTemplate,
    handleImproveFolder,
    handleEditFolder,
    handleUpdateFolder,
    handleCloseDialog,
  };
}
