// components/UserDetailsModal.tsx
"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { FiEye } from "react-icons/fi";
import Image from "next/image";

interface DetailsModalProps {
  data: Record<string, any>; // Use a generic record to handle dynamic fields
}

export default function DetailsModal({ data }: DetailsModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // List of fields you want to exclude from being displayed
  const excludeFields = [
    "password",
    "__v",
    "_id",
    "isDeleted",
    "isActive",
    "fileURL",
    "fileId",
  ];

  // Helper function to capitalize and space out camelCase or snake_case field names
  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .toUpperCase();
  };

  // State to track if fallback image has been used
  const [isFallback, setIsFallback] = useState(false);

  // Determine if the  has a profile picture
  const hasProfilePicture = data.fileURL || data.profilePicture;

  // Construct the image URL
  const imageURL = data.fileURL
    ? data.fileURL.endsWith(".jpg") ||
      data.fileURL.endsWith(".png") ||
      data.fileURL.endsWith(".jpeg") ||
      data.fileURL.endsWith(".gif")
      ? data.fileURL
      : `${data.fileURL}.jpg` // Append .jpg if missing
    : data.profilePicture
    ? `/uploads/${data.profilePicture}`
    : "/fallback.jpg"; // Default fallback

  // Handle image load error
  const handleImageError = () => {
    if (!isFallback) {
      setIsFallback(true);
    }
  };

  // Debugging: Log the imageURL
  console.log("UserDetailsModal - Image URL:", imageURL);

  return (
    <>
      <FiEye onClick={onOpen} className="cursor-pointer" />
      <Modal size="lg" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                User Details
              </ModalHeader>
              <ModalBody className="space-y-4">
                {/* Display Profile Picture if available */}
                <div className="flex justify-center">
                  {data.fileURL && (
                    <Image
                      src={data.fileURL}
                      alt={data.name || "User Profile Picture"}
                      width={300}
                      height={300}
                      style={{ objectFit: "cover" }}
                      onError={handleImageError}
                    />
                  )}
                </div>
                {/* Display User Details */}
                {Object.keys(data).map((key) => {
                  // Skip rendering excluded fields
                  if (excludeFields.includes(key)) return null;

                  // Handle nested objects
                  if (typeof data[key] === "object" && data[key] !== null) {
                    return;
                    // <div key={key}>
                    //   {/* <strong>{formatLabel(key)}:</strong>
                    //     <pre className="whitespace-pre-wrap">
                    //       {JSON.stringify(data[key], null, 2)}
                    //     </pre> */}
                    // </div>;
                  }

                  return (
                    <p key={key}>
                      <strong>{formatLabel(key)}:</strong> {data[key]}
                    </p>
                  );
                })}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
