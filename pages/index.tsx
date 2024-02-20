import Head from "next/head";
import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { events } from "@/data/eventSchedule";
import { useRef } from "react";
import { Noto_Serif_JP } from "next/font/google";
import { Inter } from "next/font/google";

const notoSerifJp = Noto_Serif_JP({
  weight: ["400", "500"],
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

type Event = {
  start: string;
  end: string;
  name: string;
  img: string;
  time: string;
  description: string;
};

export default function Home() {
  const [eventState, setEventState] = useState<"queued" | "open" | "empty">(
    "queued"
  );
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const todayEventsCount = useRef<number>(0);
  const closedEventsCount = useRef<number>(0);
  const colorFieldRef = useRef<HTMLDivElement>(null);
  const queuedEventsContainerRef = useRef<HTMLDivElement>(null);
  const notificationContentRef = useRef<HTMLParagraphElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const eventStatusTagRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const now = new Date().getTime();
    const today: string = new Date().toISOString().split("T")[0];
    const tempEvents: Event[] = [];

    console.log(today);
    console.log(new Date().toISOString().split("T")[1]);

    for (const event of events) {
      const startDay = new Date(event.start).toISOString().split("T")[0];
      if (today == startDay) {
        tempEvents.push(event);
        todayEventsCount.current++;
        const end = new Date(event.end).getTime();
        if (end < now) {
          closedEventsCount.current++;
        }
      }
    }

    setTodayEvents(tempEvents);
  }, []);

  useEffect(() => {
    for (let i = 0; i < todayEventsCount.current; i++) {
      const elem = document.getElementById("event" + i);
      if (elem) {
        if (i == closedEventsCount.current) {
          elem.scrollIntoView({ behavior: "smooth" });
          elem.style.opacity = "1";
        } else {
          elem.style.opacity = "0.2";
        }
      }
    }
  }, [todayEvents]);

  useEffect(() => {
    console.log(eventState);
    if (notificationRef.current) {
      if (eventState == "empty") {
        notificationRef.current.style.backdropFilter = "blur(10px)";
      } else {
        notificationRef.current.style.backdropFilter = "blur(0px)";
      }
    }

    if (eventState == "open") {
      colorFieldRef.current!.style.backgroundColor = "blue";
      eventStatusTagRef.current!.innerText = "開催中";
    } else {
      eventStatusTagRef.current!.innerText = "開催前";
      colorFieldRef.current!.style.backgroundColor = "black";
    }

    console.log(
      `closed: ${closedEventsCount.current}, todayEvents: ${todayEventsCount.current}`
    );

    for (let i = 0; i < todayEventsCount.current; i++) {
      const elem = document.getElementById("event" + i);
      if (elem) {
        if (i == closedEventsCount.current) {
          elem.scrollIntoView({ behavior: "smooth" });
          elem.style.opacity = "1";
        } else {
          elem.style.opacity = "0.2";
        }
      }
    }
  }, [eventState]);

  function updateEventStatus() {
    const now = new Date().getTime();

    for (const event of todayEvents) {
      const start = new Date(event.start).getTime();
      const end = new Date(event.end).getTime();

      if (now >= start && now <= end) {
        // イベントが開催中
        setEventState("open");
        notificationContentRef.current!.innerText = "イベント開催中です。";
        break;
      } else if (now < start) {
        // 次のイベントまでのカウントダウン
        const distance = start - now;
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const displayHours = hours < 10 ? "0" + hours : hours;
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const displayMinutes = minutes < 10 ? "0" + minutes : minutes;
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const displaySeconds = seconds < 10 ? "0" + seconds : seconds;
        notificationContentRef.current!.innerHTML = `<span class="hoge">次のイベントまで</span> ${displayHours}:${displayMinutes}:${displaySeconds}`;

        setEventState("queued");
        break;
      }
    }

    let count = 0;

    for (const event of todayEvents) {
      const startDay = new Date(event.start).toISOString().split("T")[0];

      const end = new Date(event.end).getTime();
      if (end < now) {
        count++;
      }
    }

    closedEventsCount.current = count;

    if (closedEventsCount.current == todayEventsCount.current) {
      // 本日のイベントがすべて終了
      setEventState("empty");
      if (notificationContentRef.current)
        notificationContentRef.current.innerText =
          "本日のイベントは終了しました。";
    }
  }

  // 1秒ごとにイベントステータスを更新
  setInterval(updateEventStatus, 1000);
  return (
    <>
      <Head>
        <title>IAMAS2024 - Event Schedule</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="status-color-field" ref={colorFieldRef}></div>
        <div className="diviser"></div>
        {/* eventState */}
        <div style={{ position: "fixed", top: "20vh", left: "12vw" }}>
          <div
            style={{
              border: "1px solid #fff",
              width: "100px",
              textAlign: "center",
              fontWeight: "bold",
              lineHeight: "2.5rem",
            }}
          >
            <p ref={eventStatusTagRef}>開催前</p>
          </div>
        </div>

        <div ref={queuedEventsContainerRef} style={{ marginBottom: "50vh" }}>
          {(() => {
            const res: ReactNode[] = [];
            todayEvents.forEach((event, id) => {
              res.push(
                <div style={{ position: "relative" }}>
                  <div
                    className={inter.className}
                    style={{
                      position: "absolute",
                      top: "-15vw",
                      left: "-15vw",
                      width: "30vw",
                      height: "30vw",
                      transform:
                        "rotate(-90deg) translateY(calc(10vw - 1.5rem)) translateX(-20vh)",
                      textAlign: "left",
                      fontSize: "3rem",
                      lineHeight: "30vw",
                    }}
                  >
                    {event.time}
                  </div>
                  <div
                    id={`event${id}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: "0 5vw -10vh",
                      padding: "20vh 0 0",
                    }}
                  >
                    <div
                      style={{
                        width: "32vw",
                        marginTop: "4rem",
                        marginLeft: "7vw",
                      }}
                    >
                      <h1 className={inter.className}>{event.name}</h1>
                      <p style={{ marginTop: "3rem", lineHeight: "1.7rem" }}>
                        {event.description}
                      </p>
                    </div>
                    <div style={{ width: "45vw", position: "relative" }}>
                      <Image
                        src={"/img/" + event.img + ".webp"}
                        alt={"/img/" + event.img + ".webp"}
                        layout="responsive"
                        width={16}
                        height={9}
                      />{" "}
                    </div>
                  </div>
                </div>
              );
            });

            return res;
          })()}
          {/* <div
            style={{
              borderTop: "2px solid gray",
              textAlign: "center",
              color: "gray",
            }}
          >
            <p
              style={{
                marginTop: "30px",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              End of Events
            </p>
          </div> */}
        </div>

        <div
          ref={notificationRef}
          className={notoSerifJp.className}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backdropFilter: "blur(0px)",
            opacity: 1,
            transition: "all 2s ease-in-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              display: "flex",
              justifyContent: "space-between",
              width: "85vw",
              left: "10vw",
              bottom: "5vh",
            }}
          >
            <p
              ref={notificationContentRef}
              style={{ fontSize: "3rem", marginTop: "auto" }}
            >
              本日のイベントは終了しました。
            </p>

            <div style={{ width: "30vw" }}>
              <Image
                src="/logo-inline.svg"
                alt="IAMAS2024"
                layout="responsive"
                width={16}
                height={9}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
