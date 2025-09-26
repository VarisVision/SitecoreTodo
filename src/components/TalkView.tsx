"use client";
import {
  Stack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Flex,
  Text,
  HStack,
  FormControl,
  Input,
  VStack,
  Box,
  Button,
  Avatar,
  Textarea,
  Spinner,
  useToast,
  Divider
} from "@chakra-ui/react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { SiteInfo, ChatMessage } from "@/types";
import { getSitecoreTalkDataForPage, updateSitecoreTalkDataForPage, createSitecoreTalkDataItem } from "@/utils/client";
import { getLocalStorage, setLocalStorage } from "@/utils/cookies";
import { useState, useEffect } from "react";

interface TalkViewProps {
  SiteInfo: SiteInfo | undefined;
  client: ClientSDK | null;
}

const STORAGE_USERNAME = 'sitecore-talk-username';

export default function TalkView({ SiteInfo, client }: TalkViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("Anonymous User");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const toast = useToast();

  // Handle client-side mounting and localStorage loading
  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    
    // Load username from localStorage
    try {
      const savedUsername = getLocalStorage(STORAGE_USERNAME);
      console.log('Loaded username from localStorage:', savedUsername); // Debug log
      if (savedUsername && savedUsername.trim()) {
        setUsername(savedUsername.trim());
      }
    } catch (error) {
      console.error('Failed to load username from localStorage:', error);
    }
  }, []);

  // Function to save username to localStorage
  const saveUsernameToStorage = (usernameToSave: string) => {
    if (isClient && usernameToSave.trim()) {
      try {
        setLocalStorage(STORAGE_USERNAME, usernameToSave.trim());
        console.log('Saved username to localStorage:', usernameToSave.trim()); // Debug log
      } catch (error) {
        console.error('Failed to save username to localStorage:', error);
      }
    }
  };

  // Save username to localStorage when it changes (only on client-side)
  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    saveUsernameToStorage(newUsername);
  };

  // Load SitecoreTalk data when component mounts or pageId changes
  useEffect(() => {
    const loadTalkData = async () => {
      if (!SiteInfo?.pageId || !client) return;
      
      setIsLoading(true);
      try {
        let data = await getSitecoreTalkDataForPage(client, SiteInfo.pageId);
        
        // If no data exists, create a new SitecoreTalk item
        if (!data) {
          const created = await createSitecoreTalkDataItem(client, SiteInfo.pageId, SiteInfo.name);
          if (created) {
            data = await getSitecoreTalkDataForPage(client, SiteInfo.pageId);
          }
        }
        
        if (data) {
          setMessages(data.talk || []);
        }
      } catch (error) {
        console.error("Failed to load SitecoreTalk data:", error);
        toast({
          title: "Error",
          description: "Failed to load chat data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTalkData();
  }, [SiteInfo?.pageId, client, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !client || !SiteInfo?.pageId) return;
    
    setIsSubmitting(true);
    try {
      const finalUsername = username.trim() || "Anonymous User";
      
      // Save username to localStorage when sending a message
      saveUsernameToStorage(finalUsername);
      
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        author: finalUsername,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, message];
      const success = await updateSitecoreTalkDataForPage(client, SiteInfo.pageId, updatedMessages);
      
      if (success) {
        setMessages(updatedMessages);
        setNewMessage("");
        toast({
          title: "Message sent",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to update SitecoreTalk data");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <Stack gap="4">
      <Card variant={"outline"}>
        <CardHeader>
          <Heading size="sm">Site Details</Heading> 
        </CardHeader>
        <CardBody>
          <Flex 
            gap={4} 
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "flex-start" }}
          >
            <Stack spacing={2} flex="1">                 
              <HStack flexWrap="wrap" spacing={{ base: 1, sm: 2 }}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Site Name:</Text>
                <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-word">{SiteInfo?.name}</Text>
              </HStack>
              <HStack flexWrap="wrap" spacing={{ base: 1, sm: 2 }}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Page ID:</Text>
                <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-all">{SiteInfo?.pageId}</Text>
              </HStack>
              <HStack flexWrap="wrap" spacing={{ base: 1, sm: 2 }}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Current Route:</Text>
                <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-word">{SiteInfo?.path}</Text>
              </HStack>
            </Stack>

            <Stack spacing={2} minW={{ base: "auto", md: "200px" }}>
              <HStack>
                <FormControl>
                    <Input value={SiteInfo?.pageId ?? ''} readOnly={true} hidden={true}/>
                    <Input value={SiteInfo?.path ?? ''} readOnly={true} hidden={true}/>
                </FormControl>
              </HStack>
            </Stack>
          </Flex>
        </CardBody>
      </Card>

      {/* Chat Window */}
      <Card variant={"outline"}>
        <CardHeader>
          <Heading size="sm">SitecoreTalk - Page Discussion</Heading>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" align="center" height="200px">
              <Spinner size="lg" />
            </Flex>
          ) : (
            <VStack spacing={4} align="stretch">
              {/* Messages Display */}
              <Box
                height="400px"
                overflowY="auto"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
                bg="gray.50"
              >
                {messages.length === 0 ? (
                  <Text color="gray.500" textAlign="center" mt={8}>
                    No messages yet. Start the conversation!
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {messages.map((message) => (
                      <Box key={message.id} p={3} bg="white" borderRadius="md" shadow="sm">
                        <Flex align="center" gap={2} mb={1}>
                          <Avatar size="sm" name={message.author} />
                          <Text fontWeight="bold" fontSize="sm" color="blue.600">
                            {message.author}
                          </Text>
                          <Text fontSize="xs" color="gray.500" ml="auto">
                            {formatTimestamp(message.timestamp)}
                          </Text>
                        </Flex>
                        <Text fontSize="sm" ml={10}>
                          {message.message}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              <Divider />

              {/* Message Input */}
              <VStack spacing={3} align="stretch">
                <Flex gap={2}>
                  <FormControl flex="1">
                    <Input
                      placeholder="Enter your name"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      size="sm"
                    />
                  </FormControl>
                </Flex>
                <Flex gap={2}>
                  <FormControl flex="1">
                    <Textarea
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      resize="vertical"
                      minHeight="60px"
                    />
                  </FormControl>
                  <Button
                    colorScheme="blue"
                    onClick={handleSendMessage}
                    isLoading={isSubmitting}
                    isDisabled={!newMessage.trim() || !client}
                    size="lg"
                    alignSelf="flex-end"
                  >
                    Send
                  </Button>
                </Flex>
              </VStack>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}
