"use client";
import AuthContext from "@/context/AuthContext";
import { ROUTES } from "@/core/routes";
import {
  Card,
  CardBody,
  CardFooter,
  Chip,
  CircularProgress,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [finalDestination, setFinalDestination] = useState<string>("");
  const [value, setValue] = useState<number>(0);

  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    // Since AuthContext checks auth status on mount, we need to wait for it
    const checkAuthentication = () => {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth");
      }
    };

    checkAuthentication();
  }, [isAuthenticated, router]);
  return (
    <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-[#F6F8FB]">
      <Card className="w-[240px] h-[240px] border-none bg-gradient-to-br from-blue-500 to-fuchsia-500">
        <CardBody className="justify-center items-center pb-0">
          <CircularProgress
            classNames={{
              svg: "w-36 h-36 drop-shadow-md",
              indicator: "stroke-white",
              track: "stroke-white/10",
              value: "text-3xl font-semibold text-white",
            }}
            value={value}
            strokeWidth={4}
            showValueLabel={true}
          />
        </CardBody>
        <CardFooter className="justify-center items-center pt-0">
          <Chip
            classNames={{
              base: "border-1 border-white/30",
              content: "text-white/90 text-small font-semibold",
            }}
            variant="bordered"
          >
            {value < 10
              ? "Starting..."
              : value < 20
              ? "Loading..."
              : value < 30
              ? "Almost there..."
              : value < 40
              ? "Halfway there..."
              : value < 50
              ? "Halfway there..."
              : value < 60
              ? "More than halfway there..."
              : value < 70
              ? "Almost done..."
              : value < 80
              ? "Finishing up..."
              : value < 90
              ? "Almost there..."
              : value < 100
              ? "Finishing up..."
              : finalDestination}
          </Chip>
        </CardFooter>
      </Card>
    </div>
  );
}
