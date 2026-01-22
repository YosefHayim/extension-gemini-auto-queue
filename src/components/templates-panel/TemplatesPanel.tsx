import React from "react";

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

  return (
    <>
      <div className="flex h-full flex-col">
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
