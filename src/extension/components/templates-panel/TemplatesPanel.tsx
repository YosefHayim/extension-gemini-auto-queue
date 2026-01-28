import { Search, Folder, Plus, Layers, Pencil, X } from "lucide-react";
import React, { useMemo } from "react";

import { FolderCreateDialog } from "@/extension/components/templates-panel/FolderCreateDialog";
import { ImproveFolderButton } from "@/extension/components/templates-panel/ImproveFolderButton";
import { TemplateEditDialog } from "@/extension/components/templates-panel/TemplateEditDialog";
import { TemplateList } from "@/extension/components/templates-panel/TemplateList";
import { useTemplatesPanel } from "@/extension/components/templates-panel/useTemplatesPanel";

import type { TemplatesPanelProps } from "@/extension/components/templates-panel/types";

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  folders,
  isDark,
  hasAIKey,
  onCreateFolder,
  onDeleteFolder,
  onUseTemplate,
  onDeleteTemplate,
  onSaveTemplate,
  onImproveTemplate,
  onImproveFolder,
  onUpdateFolder,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const {
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
  } = useTemplatesPanel({
    folders,
    onCreateFolder,
    onDeleteFolder,
    onDeleteTemplate,
    onSaveTemplate,
    onImproveTemplate,
    onImproveFolder,
    onUpdateFolder,
  });

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const query = searchQuery.toLowerCase();
    return folders.filter(
      (folder) =>
        folder.name.toLowerCase().includes(query) ||
        folder.templates.some((t) => t.text.toLowerCase().includes(query))
    );
  }, [folders, searchQuery]);

  const recentTemplates = useMemo(() => {
    const allTemplates = folders.flatMap((f) => f.templates.map((t) => ({ ...t, folderId: f.id })));
    return allTemplates.slice(0, 5);
  }, [folders]);

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2.5">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-foreground">Folders</h3>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Plus size={14} />
              New Folder
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`flex flex-col items-start gap-1.5 rounded-lg border p-3 transition-colors ${
                selectedFolderId === null
                  ? "border-zinc-400 bg-zinc-100 dark:border-zinc-500 dark:bg-zinc-800/50"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-foreground">All Templates</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {totalTemplateCount} template{totalTemplateCount !== 1 ? "s" : ""}
              </span>
            </button>

            {filteredFolders.map((folder) => (
              <div key={folder.id} className="group relative">
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex w-full flex-col items-start gap-1.5 rounded-lg border p-3 transition-colors ${
                    selectedFolderId === folder.id
                      ? "border-zinc-400 bg-zinc-100 dark:border-zinc-500 dark:bg-zinc-800/50"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-amber-500" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {folder.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {folder.templates.length} template{folder.templates.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-all group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTemplateEdit(folder.id);
                    }}
                    title="Add template"
                    className="rounded-full bg-emerald-500 p-1 text-white shadow-sm transition-all hover:bg-emerald-600"
                  >
                    <Plus size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFolder(folder);
                    }}
                    title="Edit folder"
                    className="rounded-full bg-blue-500 p-1 text-white shadow-sm transition-all hover:bg-blue-600"
                  >
                    <Pencil size={10} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    title="Delete folder"
                    className="rounded-full bg-red-500 p-1 text-white shadow-sm transition-all hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {recentTemplates.length > 0 && (
          <div className="flex flex-col gap-3 py-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-foreground">Recent Templates</h3>
              <button
                onClick={() => {}}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {recentTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onUseTemplate(template.folderId, template.id)}
                  className="truncate rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                >
                  <span className="text-muted-foreground">
                    {template.text.substring(0, 50)}
                    {template.text.length > 50 ? "..." : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedFolder && selectedFolder.templates.length > 0 && hasAIKey && (
          <ImproveFolderButton
            selectedFolder={selectedFolder}
            isDark={isDark}
            isImproving={isImprovingFolder}
            onImproveFolder={handleImproveFolder}
          />
        )}

        <TemplateList
          templates={displayedTemplates}
          isDark={isDark}
          hasAIKey={hasAIKey}
          improvingIds={improvingIds}
          selectedFolderId={selectedFolderId}
          hasFolders={folders.length > 0}
          onImprove={handleImproveTemplate}
          onEdit={handleStartTemplateEdit}
          onDelete={handleDeleteTemplate}
          onUse={onUseTemplate}
          onCreateNewTemplate={(e) =>
            selectedFolderId && handleStartTemplateEdit(selectedFolderId, undefined, e)
          }
        />
      </div>

      <FolderCreateDialog
        isOpen={isCreatingFolder}
        isDark={isDark}
        newFolderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        onCreateFolder={handleCreateFolder}
        onClose={handleCloseDialog}
        editingFolder={editingFolder}
        onUpdateFolder={handleUpdateFolder}
      />

      <TemplateEditDialog
        editingTemplate={editingTemplate}
        folders={folders}
        isDark={isDark}
        onTemplateChange={setEditingTemplate}
        onSave={handleSaveTemplate}
        onClose={() => setEditingTemplate(null)}
      />
    </>
  );
};

export default TemplatesPanel;
