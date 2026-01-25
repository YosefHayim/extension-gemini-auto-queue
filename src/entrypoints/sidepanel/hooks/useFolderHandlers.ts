import { useCallback } from "react";

import { improvePrompt } from "@/services/geminiService";
import { setFolders } from "@/services/storageService";

import type { Folder, PromptTemplate } from "@/types";

interface UseFolderHandlersProps {
  folders: Folder[];
  setFoldersState: React.Dispatch<React.SetStateAction<Folder[]>>;
  handleAddToQueue: (text?: string, templateText?: string, images?: string[]) => Promise<void>;
  setActiveTab: React.Dispatch<React.SetStateAction<"queue" | "templates" | "settings">>;
}

export function useFolderHandlers({
  folders,
  setFoldersState,
  handleAddToQueue,
  setActiveTab,
}: UseFolderHandlersProps) {
  const handleCreateFolder = useCallback(
    async (name: string, color?: string, icon?: string) => {
      const newFolder: Folder = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        templates: [],
        isOpen: true,
        color,
        icon,
      };
      const updatedFolders = [...folders, newFolder];
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, setFoldersState]
  );

  const handleDeleteFolder = useCallback(
    async (id: string) => {
      const updatedFolders = folders.filter((f) => f.id !== id);
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, setFoldersState]
  );

  const handleToggleFolder = useCallback(
    async (id: string) => {
      const updatedFolders = folders.map((f) => (f.id === id ? { ...f, isOpen: !f.isOpen } : f));
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, setFoldersState]
  );

  const handleUseTemplate = useCallback(
    (folderId: string, templateId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      const template = folder?.templates.find((t) => t.id === templateId);
      if (template) {
        handleAddToQueue(template.text, undefined, template.images).catch(() => {});
        setActiveTab("queue");
      }
    },
    [folders, handleAddToQueue, setActiveTab]
  );

  const handleDeleteTemplate = useCallback(
    async (folderId: string, templateId: string) => {
      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, templates: f.templates.filter((t) => t.id !== templateId) } : f
      );
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, setFoldersState]
  );

  const handleSaveTemplate = useCallback(
    async (folderId: string, template: Partial<PromptTemplate>) => {
      const updatedFolders = folders.map((f) => {
        if (f.id === folderId) {
          const existingIdx = f.templates.findIndex((t) => t.id === template.id);
          const updatedTemplate: PromptTemplate = {
            id: template.id ?? Math.random().toString(36).substring(2, 9),
            name: template.name ?? "Unnamed",
            text: template.text ?? "",
            createdAt: template.createdAt ?? Date.now(),
            lastEditedAt: Date.now(),
            timesUsed: template.timesUsed ?? 0,
            images: template.images ?? [],
          };

          if (existingIdx > -1) {
            const newTemplates = [...f.templates];
            newTemplates[existingIdx] = updatedTemplate;
            return { ...f, templates: newTemplates };
          } else {
            return { ...f, templates: [...f.templates, updatedTemplate] };
          }
        }
        return f;
      });
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, setFoldersState]
  );

  const handleImproveTemplate = useCallback(
    async (folderId: string, templateId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      const template = folder?.templates.find((t) => t.id === templateId);
      if (template) {
        const improvedText = await improvePrompt(template.text);
        const updatedFolders = folders.map((f) =>
          f.id === folderId
            ? {
                ...f,
                templates: f.templates.map((t) =>
                  t.id === templateId ? { ...t, text: improvedText, lastEditedAt: Date.now() } : t
                ),
              }
            : f
        );
        setFoldersState(updatedFolders);
        await setFolders(updatedFolders);
      }
    },
    [folders, setFoldersState]
  );

  const handleImproveFolder = useCallback(
    async (folderId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;

      const improvedTemplates = await Promise.all(
        folder.templates.map(async (t) => {
          const improvedText = await improvePrompt(t.text);
          return { ...t, text: improvedText, lastEditedAt: Date.now() };
        })
      );

      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, templates: improvedTemplates } : f
      );
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, setFoldersState]
  );

  const handleUpdateFolder = useCallback(
    async (folderId: string, name: string, color?: string, icon?: string) => {
      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, name, color, icon } : f
      );
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, setFoldersState]
  );

  return {
    handleCreateFolder,
    handleDeleteFolder,
    handleToggleFolder,
    handleUseTemplate,
    handleDeleteTemplate,
    handleSaveTemplate,
    handleImproveTemplate,
    handleImproveFolder,
    handleUpdateFolder,
  };
}
