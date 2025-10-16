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
import { SettingsIcon } from "@chakra-ui/icons";

interface FloatingMenuProps {
  showSetup: boolean;
  onSettingsClick: () => void;
}

export default function FloatingMenu({ showSetup, onSettingsClick }: FloatingMenuProps) {
  return (
    <Box className="floating-menu-bar">
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
          fontSize="8px"
          className="menu-dots-button"
          fontWeight="bold"
        >
          ⋮
        </MenuButton>
        <MenuList fontSize="sm" minWidth="160px" textAlign="right">
          <MenuItem 
            onClick={onSettingsClick} 
            justifyContent="flex-end"
            textAlign="right"
            sx={{
              "& .chakra-menu__icon": {
                transition: "transform 0.3s ease",
              },
              "&:hover .chakra-menu__icon": {
                transform: "rotate(180deg)",
              }
            }}
            icon={<SettingsIcon/>}
          >
            {showSetup ? "Page To Do" : "Setup & Configuration"}
          </MenuItem>
          <MenuItem 
            as={Link}
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            justifyContent="right"
          >
            Help
          </MenuItem>
          <MenuItem 
            as={Link}
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            justifyContent="right"
          >
            About
          </MenuItem>
          <MenuItem 
            cursor="default"
            _hover={{ bg: "transparent" }}
            _focus={{ bg: "transparent" }}
            display="flex"
            justifyContent="left"
            alignItems="center"
            py={2}
          >
            <Image
              src="/ping-logo.png"
              alt="PING Logo"
              height="13px"
              width="auto"
              maxHeight="20px"
              objectFit="contain"
              opacity={0.7}
            />
            <Box fontSize="11px" ml={1}>© 2025</Box>
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}