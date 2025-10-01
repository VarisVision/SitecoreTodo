"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Checkbox,
  Text,
  IconButton,
  useToast,
  Spinner,
  Center,
  Divider,
  Badge,
  Flex,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { SiteInfo, Todo } from "@/types";
import { 
  getSitecoreTodoDataForPage, 
  createSitecoreTodoDataItem, 
  updateSitecoreTodoDataForPage,
  getTodoDataTitle
} from "@/utils/client";
import EditableTitle from "./EditableTitle";

interface TodoViewProps {
  SiteInfo: SiteInfo | undefined;
  client: ClientSDK | null;
}

export default function ToDoView({ SiteInfo, client }: TodoViewProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>("My today's to do");
  const toast = useToast();

  const loadPageTitle = useCallback(async () => {
    if (!client || !SiteInfo?.pageId) return;

    try {
      const title = await getTodoDataTitle(client);
      if (title) {
        setPageTitle(title);
      } else {
        setPageTitle("My today's to do");
      }
    } catch (error) {
      console.error("Failed to load page title:", error);
    }
  }, [client, SiteInfo?.pageId]);

  const loadTodos = useCallback(async () => {
    if (!client || !SiteInfo?.id) return;

    setLoading(true);
    try {
      const todoData = await getSitecoreTodoDataForPage(client, SiteInfo.id);
      if (todoData?.todos) {
        setTodos(todoData.todos);
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
      toast({
        title: "Error",
        description: "Failed to load todos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [client, SiteInfo?.id, toast]);

  const saveTodos = useCallback(async (updatedTodos: Todo[]) => {
    if (!client || !SiteInfo?.id) return;

    setSaving(true);
    try {
      let dataItemId = await getSitecoreTodoDataForPage(client, SiteInfo.id);
      
      if (!dataItemId || !dataItemId.itemId) {
        dataItemId = await createSitecoreTodoDataItem(client, SiteInfo.id, SiteInfo.name);
      }

      if (dataItemId && dataItemId.itemId) {
        await updateSitecoreTodoDataForPage(client, SiteInfo.id, updatedTodos);
        setTodos(updatedTodos);
      } else {
        throw new Error("Failed to get or create data item");
      }
    } catch (error) {
      console.error("Failed to save todos:", error);
      toast({
        title: "Error",
        description: `Failed to save todos: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  }, [client, SiteInfo?.id, SiteInfo?.name, toast]);

  useEffect(() => {
    loadTodos();
    loadPageTitle();
  }, [loadTodos, loadPageTitle]);

  const addTodo = async () => {
    if (!newTodoText.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTodos = [...todos, newTodo];
    await saveTodos(updatedTodos);
    setNewTodoText("");
  };

  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
        : todo
    );
    await saveTodos(updatedTodos);
  };

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    await saveTodos(updatedTodos);
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    if (!editingText.trim()) return;

    const updatedTodos = todos.map(todo =>
      todo.id === editingId
        ? { ...todo, text: editingText.trim(), updatedAt: new Date().toISOString() }
        : todo
    );
    await saveTodos(updatedTodos);
    cancelEditing();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingId) {
        saveEdit();
      } else {
        addTodo();
      }
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <VStack spacing={4} align="stretch">
        <Box>
          {client && SiteInfo?.id && (
            <EditableTitle
              title={pageTitle}
              onTitleChange={setPageTitle}
              client={client}
              siteId={SiteInfo.id}
            />
          )}
        </Box>
        <Box>
          <InputGroup>
            <Input
              placeholder="Add a new todo..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={saving}
            />
            <InputRightElement>
              <IconButton
                aria-label="Add todo"
                icon={<AddIcon />}
                onClick={addTodo}
                disabled={!newTodoText.trim() || saving}
                colorScheme="blue"
                size="sm"
              />
            </InputRightElement>
          </InputGroup>
        </Box>

        {saving && (
          <Center>
            <HStack>
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.600">Saving...</Text>
            </HStack>
          </Center>
        )}

        <VStack spacing={2} align="stretch">
          {todos.length === 0 ? (
            <Center py={8}>
              <Text color="gray.500" fontSize="lg">
                No todos yet. Add one above to get started!
              </Text>
            </Center>
          ) : (
            todos.map((todo) => (
              <Box
                key={todo.id}
                p={3}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                bg={todo.completed ? "gray.50" : "white"}
                opacity={todo.completed ? 0.7 : 1}
              >
                <HStack spacing={3}>
                  <Checkbox
                    isChecked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    colorScheme="blue"
                    size="lg"
                  />
                  
                  {editingId === todo.id ? (
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      size="sm"
                    />
                  ) : (
                    <Text
                      flex={1}
                      textDecoration={todo.completed ? "line-through" : "none"}
                      color={todo.completed ? "gray.500" : "black"}
                      fontSize="md"
                    >
                      {todo.text}
                    </Text>
                  )}

                  <HStack spacing={1}>
                    {editingId === todo.id ? (
                      <>
                        <IconButton
                          aria-label="Save edit"
                          icon={<CheckIcon />}
                          onClick={saveEdit}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                        />
                        <IconButton
                          aria-label="Cancel edit"
                          icon={<CloseIcon />}
                          onClick={cancelEditing}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                        />
                      </>
                    ) : (
                      <>
                        <IconButton
                          aria-label="Edit todo"
                          icon={<EditIcon />}
                          className="edit-icon__fix"
                          onClick={() => startEditing(todo.id, todo.text)}
                          size="sm"
                          variant="ghost"
                        />
                        <IconButton
                          aria-label="Delete todo"
                          icon={<DeleteIcon />}
                          onClick={() => deleteTodo(todo.id)}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                        />
                      </>
                    )}
                  </HStack>
                </HStack>
              </Box>
            ))
          )}
        </VStack>

        {todos.length > 0 && (
          <>
            <Divider />
            <Flex justify="space-between" align="center">
              <Badge
                colorScheme={completedCount === totalCount ? "green" : "blue"}
                variant="subtle"
                fontSize="sm"
              >
                {completedCount === totalCount ? "All done!" : `${completedCount}/${totalCount} completed`}
              </Badge>
              {completedCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    const updatedTodos = todos.filter(todo => !todo.completed);
                    saveTodos(updatedTodos);
                  }}
                >
                  Clear completed
                </Button>
              )}
            </Flex>
          </>
        )}
      </VStack>
    </Box>
  );
}