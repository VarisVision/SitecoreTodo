"use client";
import { useState } from "react";
import {
  HStack,
  Input,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { updateTodoDataTitle } from "@/utils/client";

interface EditableTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  client: ClientSDK | null;
  siteId: string;
}

export default function EditableTitle({ 
  title, 
  onTitleChange, 
  client, 
  siteId 
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const toast = useToast();

  const startEditing = () => {
    setIsEditing(true);
    setEditingText(title);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingText("");
  };

  const saveEdit = async () => {
    if (!editingText.trim() || !client) return;

    try {
      const success = await updateTodoDataTitle(client, siteId, editingText.trim());
      if (success) {
        onTitleChange(editingText.trim());
        setIsEditing(false);
        setEditingText("");
        toast({
          title: "Success",
          description: "Title updated successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to update title");
      }
    } catch (error) {
      console.error("Failed to update title:", error);
      toast({
        title: "Error",
        description: "Failed to update title",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  if (isEditing) {
    return (
      <HStack mb={2}>
        <Input
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
          fontSize="2xl"
          fontWeight="bold"
          variant="flushed"
        />
        <IconButton
          aria-label="Save title"
          icon={<CheckIcon />}
          onClick={saveEdit}
          size="sm"
          colorScheme="green"
        />
        <IconButton
          aria-label="Cancel title edit"
          icon={<CloseIcon />}
          onClick={cancelEditing}
          size="sm"
          colorScheme="red"
          variant="ghost"
        />
      </HStack>
    );
  }

  return (
    <HStack 
      mb={2} 
      role="group" 
      spacing={2}
      cursor="pointer"
    >
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      <IconButton
        aria-label="Edit title"
        icon={<EditIcon />}
        onClick={startEditing}
        className="edit-icon__fix"
        size="sm"
        variant="ghost"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.2s"
      />
    </HStack>
  );
}

