import {
  Avatar,
  Card,
  Modal,
  ModalContent,
  Select,
  SelectItem,
} from "@nextui-org/react";
import React from "react";

const VerifyActivityModal = ({
  open,
  close,
  activity,
}: {
  open: boolean;
  close: () => void;
  activity: any;
}) => {
  return (
    <Modal isOpen={open} onClose={close} className="" size="lg">
      <ModalContent className="pt-6">
        <div className="text-lg font-medium pl-4">Verify Activity</div>
        {/* Translate */}
        <div className="flex flex-col p-5 border-none">
          <div className="flex justify-between w-full items-center pb-4">
            <div className="text-[#3EADEB] text-lg font-medium">
              {activity.projectName}
            </div>
          </div>
          <div>
            {/* Render project manager */}
            <div className="flex">
              <Avatar
                src={activity.projectManager.avatar}
                alt="avatar"
                size="lg"
              />
              <div className="flex flex-col px-2">
                <div className="font-medium">
                  {activity.projectManager.name}
                </div>
                <div className="text-[#A1A1AA] text-sm">
                  {activity.projectManager.role}
                </div>
              </div>
            </div>

            <div className="text-[#A1A1AA] text-sm pt-4 pb-8">
              {activity.description}
            </div>
            <Card className="bg-[#F8F8F8] border-1 border-[#E9E9E9] flex justify-center items-center text-[#454545]">
              <div className="flex justify-between w-[90%] mt-4 mb-8">
                <div className="flex flex-col w-[50%]">
                  <div className="text-sm font-medium">Actual Date</div>
                  {/* Translate */}
                  <div className="text-xs pt-2">{activity.actualdate}</div>
                  {/* Translate */}
                </div>
                <div className="flex flex-col w-[50%]">
                  <div className="text-sm font-medium">Forecast Date</div>
                  {/* Translate */}
                  <div className="text-xs pt-2">{activity.forecastdate}</div>
                </div>
              </div>
              {/* Render status and sub status */}
              <div className="flex justify-between pt-5 pb-10 w-[90%]">
                <div className="flex flex-col w-[50%]">
                  <div className="text-sm font-medium">Target Date</div>
                  {/* Translate */}
                  <div className="text-xs pt-2">{activity.targetdate}</div>
                </div>
                <div className="w-[50%]">
                  <Select placeholder="Status">
                    {(activity.statusOptions as any[]).map((option: any) => (
                      <SelectItem key={option.key} className={option.color}>
                        {option.text}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default VerifyActivityModal;
