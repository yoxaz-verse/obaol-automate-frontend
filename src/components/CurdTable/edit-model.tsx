"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  Input,
  Select,
  SelectItem,
  ModalBody,
  Chip,
  Button,
  ModalFooter,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { patchData, putData } from "@/core/api/apiHandler"; // Ensure putData is correctly implemented
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";
import { Key } from "react";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { Dashboard } from "@uppy/react";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import Image from "next/image";
import { FormField } from "./add-model"; // Ensure the path is correct
import { TbEdit } from "react-icons/tb";

// Define the structure of the response from the upload endpoint
interface UploadResponse {
  fileIds: string[];
  fileURLs: string[];
}

interface EditModalProps {
  currentTable: string;
  formFields: FormField[];
  apiEndpoint: string;
  refetchData: () => void;
  initialData: Record<string, any>; // Existing data to populate the form
}

const EditModal: React.FC<EditModalProps> = ({
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
  initialData,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const uppyRef = useRef<Uppy | null>(null);

  // Helper function to construct image URLs from file IDs
  const getImageUrl = (fileID: string): string => {
    // Define your base URL or uploads path
    const baseUploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads/";
    // Ensure that the baseUploadsUrl ends with a slash
    return `${baseUploadsUrl}${fileID}`;
  };

  // Initialize Uppy instance
  useEffect(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1, // Adjust as needed
        allowedFileTypes: ["image/*", "application/pdf"], // Example: images and PDFs
        maxFileSize: 10 * 1024 * 1024, // 10 MB
      },
      autoProceed: false,
      allowMultipleUploads: false,
      debug: false, // Set to true for debugging
    });

    uppyInstance.use(XHRUpload, {
      endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/upload`, // Ensure NEXT_PUBLIC_BASE_URL is set in .env
      fieldName: "file", // Must match backend's expected field name
      formData: true,
      method: "POST",
      bundle: false, // Send files individually
      withCredentials: true,
      headers: {
        // Add any required headers here, e.g., authorization tokens
        // Authorization: `Bearer ${yourToken}`,
      },
    });

    uppyRef.current = uppyInstance;

    return () => {
      uppyInstance; // Properly clean up the Uppy instance
    };
  }, [apiEndpoint]);

  // Initialize formData with initialData
  useEffect(() => {
    const updatedFormData: Record<string, any> = { ...initialData };

    formFields.forEach((field) => {
      if (field.type === "select" && initialData[field.key]) {
        if (
          typeof initialData[field.key] === "object" &&
          initialData[field.key]?._id
        ) {
          // Set the field to the ID
          updatedFormData[field.key] = initialData[field.key]._id;
        } else if (typeof initialData[field.key] === "string") {
          // Field is already an ID or string
          updatedFormData[field.key] = initialData[field.key];
        }
      } else if (field.type === "multiselect" && initialData[field.key]) {
        if (Array.isArray(initialData[field.key])) {
          // Map objects to IDs if necessary
          updatedFormData[field.key] = initialData[field.key].map((item: any) =>
            item._id ? item._id : item
          );
        }
      }
    });

    setFormData(updatedFormData);
  }, [initialData, formFields]);

  const openModal = () => setOpen(true);
  const closeModal = () => {
    setOpen(false);
    setFormData({});
    if (uppyRef.current) {
      uppyRef.current.destroy();
    }
  };

  // Mutation to handle data update
  const editItem = useMutation({
    mutationFn: async (data: any) => patchData(apiEndpoint, data, {}),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [currentTable, apiEndpoint],
      });

      showToastMessage({
        type: "success",
        message: `${capitalize(currentTable)} Updated Successfully`,
        position: "top-right",
      });
      closeModal();
      setLoading(false);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "An error occurred",
        position: "top-right",
      });
      setLoading(false);
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hasFileInput = formFields.some(
        (field) => field.type === "file" || field.type === "image"
      );

      let fileId: string | null = null;
      let fileURL: string | null = null;

      if (
        hasFileInput &&
        uppyRef.current &&
        uppyRef.current.getFiles().length > 0
      ) {
        // Define the entities array based on the current form context
        const entities = [
          { entity: "projects", entityId: "projectId123" }, // Replace with actual IDs or pass as props
          { entity: "activities", entityId: "activityId456" },
          { entity: "timesheets", entityId: "timesheetId789" },
        ];

        // Attach form data as meta data, including the entities array
        uppyRef.current.setMeta({
          ...formData,
          entities: JSON.stringify(entities), // Serialize the array
        });

        // Initiate the upload
        const uploadResult = await uppyRef.current.upload();
        console.log("Uppy upload result:", uploadResult);

        if (uploadResult?.failed && uploadResult.failed.length > 0) {
          // Handle upload failures
          showToastMessage({
            type: "error",
            message: "File upload failed",
            position: "top-right",
          });
          setLoading(false);
          return;
        }

        // Extract the file ID and construct the file URL
        const uploadedFile =
          uploadResult?.successful && uploadResult.successful[0];

        if (
          uploadedFile &&
          uploadedFile.response &&
          uploadedFile.response.body
        ) {
          const responseBody = uploadedFile.response.body as any;
          fileId = responseBody.fileIds[0];
          fileURL = responseBody.fileURLs[0]
            ? responseBody.fileURLs[0]
            : getImageUrl(responseBody.fileIds[0]); // Fallback to constructed URL
        }

        if (!fileId || !fileURL) {
          // Handle missing fileId or fileURL
          showToastMessage({
            type: "error",
            message: "Failed to retrieve uploaded file details",
            position: "top-right",
          });
          setLoading(false);
          return;
        }
      }

      // Prepare the complete form data
      const completeFormData = {
        ...formData,
        fileId: fileId || initialData.fileId, // Preserve existing fileId if no new file uploaded
        fileURL: fileURL || initialData.fileURL, // Preserve existing fileURL if no new file uploaded
      };

      // Proceed with form submission
      editItem.mutate(completeFormData);
    } catch (error: any) {
      console.error("Submission error:", error);
      showToastMessage({
        type: "error",
        message: "An error occurred during submission",
        position: "top-right",
      });
      setLoading(false);
    }
  };

  // Handle input changes for text fields
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle selection changes for select and multiselect fields
  const handleSelectionChange = (fieldKey: string, value: Set<Key>) => {
    const valueArray = Array.from(value).map(String);
    setFormData((prevData) => ({
      ...prevData,
      [fieldKey]: valueArray,
    }));
  };

  // Handle chip removal for multiselect fields
  const handleChipClose = (itemToRemove: string, fieldKey: string) => {
    const updatedItems = formData[fieldKey].filter(
      (item: string) => item !== itemToRemove
    );
    setFormData((prevData) => ({
      ...prevData,
      [fieldKey]: updatedItems,
    }));
  };

  // Helper function to capitalize strings
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Helper function to render form fields based on type
  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            name={field.key}
            required
            placeholder={field.label}
            className="py-2 border rounded-md w-full"
            value={formData[field.key] || ""}
            onChange={handleInputChange}
          />
        );

      case "select":
        if (field.values && field.values.length > 0)
          return (
            <Select
              name={field.key}
              required
              label={`Select ${field.label}`}
              placeholder={field.label}
              className="py-2 border rounded-md w-full"
              selectedKeys={
                formData[field.key]
                  ? new Set([String(formData[field.key])])
                  : new Set()
              }
              onSelectionChange={(keys) =>
                handleInputChange({
                  target: {
                    name: field.key,
                    value: String(Array.from(keys)[0]),
                  },
                })
              }
            >
              {field.values.map((option: any) => (
                <SelectItem key={String(option.key)} value={String(option.key)}>
                  {option.value}
                </SelectItem>
              ))}
            </Select>
          );

      case "multiselect":
        if (field.values && field.values.length > 0)
          return (
            <>
              <Select
                name={field.key}
                label={`Select Multiple ${field.label}`}
                placeholder={field.label}
                className="py-2 border rounded-md w-full"
                selectionMode="multiple"
                selectedKeys={
                  formData[field.key] ? new Set(formData[field.key]) : new Set()
                }
                onSelectionChange={(keys) =>
                  handleSelectionChange(field.key, keys as Set<Key>)
                }
              >
                {field.values.map((option: any) => (
                  <SelectItem
                    key={String(option.key)}
                    value={String(option.key)}
                  >
                    {option.value}
                  </SelectItem>
                ))}
              </Select>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(formData[field.key] || []).map(
                  (item: string, index: number) => (
                    <Chip
                      key={index}
                      onClose={() => handleChipClose(item, field.key)}
                      variant="flat"
                    >
                      {field.values?.find((option: any) => option.key === item)
                        ?.value || item}
                    </Chip>
                  )
                )}
              </div>
            </>
          );

      case "file":
      case "image":
        return (
          <div>
            <label className="block mb-2">{field.label}</label>
            {uppyRef.current && (
              <Dashboard
                uppy={uppyRef.current}
                hideUploadButton
                proudlyDisplayPoweredByUppy={false}
                note="Only image and document files are allowed."
              />
            )}
            {/* Display existing image or file */}
            {formData[field.key] && (
              <div className="mt-4 flex justify-center">
                {typeof formData[field.key] === "string" &&
                (formData[field.key].endsWith(".pdf") ||
                  formData[field.key].endsWith(".PDF")) ? (
                  <a
                    href={formData[field.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View PDF
                  </a>
                ) : typeof formData[field.key] === "string" ? (
                  <Image
                    src={getImageUrl(formData[field.key])} // Ensure getImageUrl returns a valid URL
                    alt={`${field.label} Preview`}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            name={field.key}
            type={field.type}
            required
            placeholder={field.label}
            className="py-2"
            value={formData[field.key] || ""}
            onChange={handleInputChange}
          />
        );
    }
  };

  return (
    <>
      {/* Edit Button */}
      {/* <button
        className="w-[100px] bg-yellow-500 rounded-3xl text-white h-[38px] text-sm"
        onClick={openModal}
      >
        Edit
      </button> */}

      <TbEdit onClick={openModal} className="hover:text-purple-600" />

      {/* Edit Modal */}
      {initialData && (
        <Modal isOpen={open} onClose={closeModal} size="lg">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Edit {capitalize(currentTable)}
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit}>
                {formFields
                  .filter((field) => field.inForm)
                  .map((field, index) => (
                    <div key={index} className="mb-4">
                      {renderFormField(field)}
                    </div>
                  ))}
                <div className="flex justify-end w-full mt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-[100px]"
                    color="primary"
                  >
                    {loading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default EditModal;
