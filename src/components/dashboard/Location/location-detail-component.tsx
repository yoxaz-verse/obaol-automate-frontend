import React from "react";
import { Card, CardBody } from "@nextui-org/react";

const LocationDetailComponent = ({ data }: { data: any }) => {
  return (
    <div className="w-full h-full">
      <div className="flex w-full h-full ">
        {data.location && (
          <div className="w-full mb-2  ">
            <div className="sm:flex w-full gap-2 ">
              <Card className="w-1/3 lg:w-1/3 mb-6 py-2 mt-4 lg:mt-0">
                <CardBody className="flex flex-col">
                  <div className="text-sm font-medium">{"Location"}</div>
                  <div>{data.location.name ?? "location"}</div>
                </CardBody>
              </Card>
              <Card className="w-2/3 lg:w-2/3 mb-6 py-2 mt-4 lg:mt-0">
                <CardBody className="flex flex-col">
                  <div className="text-sm font-medium">{"Address"}</div>
                  <div>{data.location.address ?? "Custom Id"}</div>
                </CardBody>
              </Card>
            </div>
            {data.location && data.location.map && (
              <div className="w-full  rounded-lg">
                {data.location.longitude && data.location.latitude && (
                  <iframe
                    src={`https://maps.google.com/maps?q=${data.location.latitude},${data.location.longitude}&hl=es&z=14&output=embed`}
                    className="w-full h-[400px] lg:h-[375px] rounded-lg"
                  />
                )}
                {data.location && data.location.map && (
                  <iframe
                    src={data.location.map}
                    className="w-full h-[400px] lg:h-[375px] rounded-lg"
                  />
                )}
              </div>
            )}
            <Card className=" border-1 flex justify-center items-center text-[#454545] my-2">
              <div className="flex justify-between w-[90%] mt-4 mb-8">
                <div className="flex flex-col w-[50%]">
                  <div className="text-sm font-medium">Location</div>
                  {/* Translate */}
                  <div className="text-xs pt-2">
                    {" "}
                    {data.location.city && data.location.city}
                    {data.location.province && data.location.province}
                    {data.location.region && data.location.region}
                    {data.location.nation && data.location.nation}
                  </div>
                </div>
              </div>
              {/* Render status and sub status */}
              {/* <div className="flex justify-between pt-5 pb-10 w-[90%]"></div> */}
            </Card>
            {data.location.locationManagers && (
              <LocationManagerList managers={data.location.locationManagers} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetailComponent;

const LocationManagerList = ({ managers }: { managers: any[] }) => {
  return (
    <div className="mt-4">
      {/* <div className="text-sm font-medium mb-2">Location Managers</div> */}
      <div className="flex gap-2">
        {managers.map((manager) => (
          <Card key={manager._id} className="mb-2 py-2">
            <CardBody className="flex flex-col">
              <div className="text-xs">Manager</div>
              <div className="text-sm font-medium ">{manager.manager.name}</div>
              <div className="text-xs mt-2">Code</div>
              <div className="text-sm font-medium ">{manager.code}</div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
