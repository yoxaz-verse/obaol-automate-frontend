import { Card, CardBody, CardHeader, Spacer } from "@nextui-org/react";
import React from "react";

const ProjectDetailCard = ({ data }: { data: any }) => {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex justify-between w-full items-center pb-4">
        <div className="text-[#3EADEB] text-lg font-medium">
          {data.title ?? "Title"}
        </div>
        <div className="text-[#A1A1AA] text-sm pt-2 ">
          {"Order No"} :{" "}
          <span className="text-black">
            {data.orderNumber ?? "Order Number"}
          </span>
        </div>{" "}
        <div>{/* <FiEdit /> */}</div>
      </div>
      <div>
        {/* Render project manager */}

        <div className="flex">
          <div className="flex flex-col ">
            <div className="font-medium">
              {data?.customer?.name ?? "Customer Name"}
            </div>
            <div className="text-[#A1A1AA] text-sm">Customer</div>
            {/* Translate */}
          </div>
        </div>
        <div className="text-[#A1A1AA] text-sm pt-4 ">{"Description"}</div>
        <div className=" text-sm  pb-4">
          {data.description ?? "Description"}
        </div>

        <div className="text-[#A1A1AA] text-sm pt-2 ">{"Task"}</div>
        <div className=" text-sm pb-8">{data.task ?? "Task"}</div>
        <div className="flex justify-between w-full">
          <Card className="w-[230px] pb-1">
            <CardBody>
              {/* <Avatar alt="avatar" size="sm" /> */}
              <div className=" text-sm">Project Manager</div>
              {/* Translate */}
              <Spacer y={1} />
              <div className="pl-2">{/* <FiEdit /> */}</div>{" "}
              <div className="flex flex-col ">
                <div className="font-medium">
                  {data?.projectManager?.name ?? ""}
                </div>
                <div className="text-[#A1A1AA] text-sm">
                  {data?.projectManager?.email ?? ""}
                </div>
                {/* <div className='text-[#A1A1AA] text-sm'>{data.projectManager.role}</div> */}
              </div>
            </CardBody>
          </Card>
          <Card className="w-[230px]">
            <CardBody>
              <div className="text-[#A1A1AA] text-sm pt-4 ">
                {"Live Status"}
              </div>
              <div className="font-medium">
                {data?.status?.name ?? "Status"}
              </div>
              {/* <Select className="w-full" placeholder="Status">
                <SelectItem key={1}>Status 1</SelectItem>
                <SelectItem key={2}>Status 2</SelectItem>
                <SelectItem key={3}>Status 3</SelectItem>
              </Select> */}
            </CardBody>
          </Card>{" "}
          {/* <Card className="w-[230px]">
            <CardHeader className="font-medium">Workers/Services</CardHeader>
            <AvatarGroup className="w-full items-start justify-start pl-3">
              <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
              <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
            </AvatarGroup>
          </Card> */}
        </div>
        {/* Render status and sub status */}
      </div>
    </Card>
  );
};

export default ProjectDetailCard;
