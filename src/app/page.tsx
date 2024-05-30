"use client"
import { ROUTES } from "@/core/routes";
import { Card, CardBody, CardFooter, Chip, CircularProgress } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [finalDestination, setFinalDestination] = useState<string>('');
  const [value, setValue] = useState<number>(0);
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("currentUserToken");
    const rememberMeTimeStr = localStorage.getItem("rememberMeTime");
    const rememberMeTime = rememberMeTimeStr ? JSON.parse(rememberMeTimeStr) : null;

    console.log("rememberMeTime:", rememberMeTime);
    console.log("token:", token);

    // Step 1: Check for token
    if (!token) {
      console.log("No token found");
      setValue(10);
      setFinalDestination("Redirecting to login page...");
      setLoadingComplete(true);
      router.push("/auth");
      setValue(100);
      return;
    } else {
      setValue(10); // Increment to 10% if token exists
    }

    // Step 2: Check for remember me time
    if (rememberMeTime && rememberMeTime < new Date().getTime()) {
      console.log("Remember me time expired");
      setValue(30);
      setFinalDestination("Redirecting to login page...");
      setLoadingComplete(true);
      router.push("/auth");
      return;
    } else {
      setValue(30); // Increment to 30% if remember me time is valid
    }

    // Step 3: Validate the token with the server
    if (token) {
      console.log("Token found, fetching user data");
      setValue(50); // Increment to 50% before starting the fetch call

      fetch("http://localhost:5000/api/v1/check-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }
          setValue(70); // Increment to 70% after successfully fetching data
          return res.json();
        })
        .then((data) => {
          console.log("User data fetched:", data);
          setFinalDestination("Redirecting to dashboard...");
          setLoadingComplete(true);
          setValue(100); // Increment to 100% on successful validation
          router.push(ROUTES.DASHBOARD);
        })
        .catch((error) => {
          console.log("Error fetching user data");
          console.error(error);
          setFinalDestination("Redirecting to login page...");
          setLoadingComplete(true);
          setValue(100); // Increment to 100% on error as well
          router.push("/auth");
        });
    }
  }, [router]);
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
            {
              // for every 10 value, we show a different message
              value < 10
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
                                  : finalDestination

            }
          </Chip>
        </CardFooter>
      </Card>
    </div>
  );
}