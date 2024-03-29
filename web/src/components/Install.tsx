import { JSX, VNode } from "preact";
import { useTitle } from "hoofd/preact";

import { Routes } from "../constants";
import install, { InstallData } from "../install";

import styles from "./install.module.css";
import sharedStyle from "./shared.module.css";

import Zap from "feather-icons/dist/icons/zap.svg";

import { useEffect, useState } from "preact/hooks";

interface Props {
  matches: InstallData;
}

export default function InstallPage({ matches: data }: Props): VNode {
  useTitle("Addon Installer");

  const [title, setTitle] = useState("Loading...");
  const [description, setDescription] = useState<string | JSX.Element>("");
  const [connectedTime, setConnectedTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const setConnectedText = (): void => {
    setTitle("Connected to Replugged");
    setDescription("Please confirm the addon installation in Discord.");
    setConnectedTime(null);
  };
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (connectedTime && !isFinished) {
      const time = 100 - (Date.now() - connectedTime);
      if (time <= 0) {
        setConnectedText();
      } else {
        timeout = setTimeout(setConnectedText, time);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [connectedTime, isFinished, title, description]);

  const makeRequest = (): void => {
    if (data.url) {
      setTitle("Addon not supported");
      setDescription(
        "This addon was made for an unsupported version of Replugged and cannot be installed.",
      );
      return;
    }

    if (!data.identifier) {
      setTitle("No addon identifier provided");
      return;
    }

    setTitle("Connecting to Replugged...");
    setDescription("Please wait while we connect to Replugged.");
    setConnectedTime(null);
    setIsFinished(false);

    install({
      data,
      onConnect: () => {
        setConnectedTime(Date.now());
      },
      onFinish: (res) => {
        setIsFinished(true);

        switch (res.kind) {
          case "SUCCESS":
            setTitle("Success!");
            setDescription(`Successfully installed ${res.manifest.name}.`);
            break;
          case "ALREADY_INSTALLED":
            setTitle("Already installed");
            setDescription(`${res.manifest.name} is already installed.`);
            break;
          case "FAILED":
            setTitle("Failed to get addon info");
            setDescription(
              "Please double check that that the information you provided is correct.",
            );
            break;
          case "CANCELLED":
            setTitle("Installation cancelled");
            setDescription("Installation was cancelled by the user.");
            break;
          case "UNREACHABLE":
            setTitle("Could not connect to Replugged");
            setDescription(
              <>
                Please make sure Discord is open with the latest version of Replugged installed and
                try again.
                <br />
                <div className={styles.buttons}>
                  <a href={Routes.DOWNLOAD} className={sharedStyle.button}>
                    {/* @ts-expect-error class */}
                    <Zap className={sharedStyle.icon} />
                    <span>Download Replugged</span>
                  </a>
                  <a onClick={() => makeRequest()} className={sharedStyle["button-link"]}>
                    <span>Try again</span>
                  </a>
                </div>
              </>,
            );
            break;
        }
      },
    });
  };

  useEffect(makeRequest, []);

  return (
    <div className={styles.container}>
      <div className={styles.centerText}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
