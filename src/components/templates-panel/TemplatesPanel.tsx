import React, { useMemo } from "react";
import { Search, Folder, Plus } from "lucide-react";

import { FolderBar } from "./FolderBar";
import { FolderCreateDialog } from "./FolderCreateDialog";
import { ImproveFolderButton } from "./ImproveFolderButton";
import { TemplateEditDialog } from "./TemplateEditDialog";
import { TemplateList } from "./TemplateList";
import { useTemplatesPanel } from "./useTemplatesPanel";

import type { TemplatesPanelProps } from "./types";

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  folders,
  isDark,
  hasAIKey,
  onCreateFolder,
  onDeleteFolder,
  onToggleFolder,
  onUseTemplate,
  onDeleteTemplate,
  onSaveTemplate,
  onImproveTemplate,
  onImproveFolder,
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
  } = useTemplatesPanel({
    folders,
    onCreateFolder,
    onDeleteFolder,
    onDeleteTemplate,
    onSaveTemplate,
    onImproveTemplate,
    onImproveFolder,
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

        {filteredFolders.length > 0 && (
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
              {filteredFolders.slice(0, 4).map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex flex-col items-start gap-1.5 rounded-lg border p-3 transition-colors ${
                    selectedFolderId === folder.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-amber-500" />
                    <span className="text-sm font-medium text-foreground">{folder.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {folder.templates.length} template
                    {folder.templates.length !== 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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

        <div className="my-2 h-px bg-border" />

        <FolderBar
          folders={folders}
          selectedFolderId={selectedFolderId}
          totalTemplateCount={totalTemplateCount}
          isDark={isDark}
          onCreateFolderClick={() => setIsCreatingFolder(true)}
          onSelectFolder={setSelectedFolderId}
          onToggleFolder={onToggleFolder}
          onDeleteFolder={handleDeleteFolder}
        />

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
          onCreateTemplate={() => {
            const folder = folders.find((f) => f.id === selectedFolderId);
            if (folder) handleStartTemplateEdit(folder.id);
          }}
          onCreateNewTemplate={(e) => handleStartTemplateEdit(selectedFolderId!, undefined, e)}
        />
      </div>

      <FolderCreateDialog
        isOpen={isCreatingFolder}
        isDark={isDark}
        newFolderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        onCreateFolder={handleCreateFolder}
        onClose={() => setIsCreatingFolder(false)}
      />

      <TemplateEditDialog
        editingTemplate={editingTemplate}
        isDark={isDark}
        onTemplateChange={setEditingTemplate}
        onSave={handleSaveTemplate}
        onClose={() => setEditingTemplate(null)}
      />
    </>
  );
};

export default TemplatesPanel;
