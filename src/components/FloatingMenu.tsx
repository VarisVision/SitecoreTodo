"use client";
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  Image
} from "@chakra-ui/react";
import Icon from '@mdi/react';
import { mdiDotsHorizontal, mdiHelpCircleOutline, mdiInformationOutline } from '@mdi/js';

export default function FloatingMenu() {
  const currentYear = new Date().getFullYear();

  return (    
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="38px"
      backgroundColor="#E9E9E9"
      zIndex={1001}
      display="flex"
      alignItems="center"
      justifyContent="flex-end"
      paddingRight="8px"
      className="floating-menu-bar"
    >
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Menu options"
          variant="ghost"
          size="xs"
          color="black"
          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          _active={{ bg: "rgba(255, 255, 255, 0.2)" }}
          minHeight="18px"
          height="18px"
          width="20px"            
          fontSize="12px"
          className="menu-dots-button"
          fontWeight="bold"
        >
          <Icon path={mdiDotsHorizontal} size={1} />
        </MenuButton>
        <MenuList fontSize="sm" minWidth="160px" textAlign="left" p={0}>
          {/* Menu Items */}
          <Box>
            <MenuItem 
              as={Link}
              href="https://www.ping-works.com.au/services/sitecore-xm-cloud-plugins/to-do"
              target="_blank"
              rel="noopener noreferrer"
              justifyContent="flex-start"
              textDecoration="none"
              _hover={{ textDecoration: "none" }}
              icon={<Icon path={mdiHelpCircleOutline} size={1} />}
            >
              Help
            </MenuItem>
            <MenuItem 
              as={Link}
              href="https://www.ping-works.com.au/services/sitecore-xm-cloud-plugins"
              target="_blank"
              rel="noopener noreferrer"
              justifyContent="flex-start"
              textDecoration="none"
              _hover={{ textDecoration: "none" }}
              icon={<Icon path={mdiInformationOutline} size={1} />}
            >
              About
            </MenuItem>
          </Box>

          {/* Footer with PING logo */}
          <Box
            backgroundColor="#E9E9E9"
            borderTop="1px solid #E0E0E0"
            py="2px"
            px={2}
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Image
              src="/ping-logo.png"
              alt="PING Logo"
              height="15px"
              width="auto"
              maxHeight="20px"
              objectFit="contain"
              opacity={0.7}
            />
            <Box fontSize="11px" ml={1} color="gray.600">© {currentYear}</Box>
          </Box>
        </MenuList>
      </Menu>
    </Box>
  );
}