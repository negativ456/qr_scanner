import React, { useState, useEffect, useCallback, useRef } from "react";
import Quagga from "quagga";
import Webcam from "react-webcam";
import cls from "./styles.module.scss";
import error from "./assets/error.svg";
import success from "./assets/success.svg";
import classNames from "classnames";

const BarcodeScanner = () => {
  const [scannedCode, setScannedCode] = useState("");
  const webcamRef = React.useRef(null);
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);

  const handleDevices = useCallback(
    (mediaDevices) => {
      const devices = mediaDevices.filter(({ kind }) => kind === "videoinput");
      setDevices(devices);
      setDeviceId(
        devices.length > 1 ? devices[1].deviceId : devices[0].deviceId
      );
      console.log(devices);
    },
    [setDevices]
  );
  const handleDetect = useCallback(
    (result) => {
      const code = result.codeResult.code;
      if (code.includes("OZN") && !isScanned) {
        setScannedCode(code);
        if (isFixed) {
          setIsScanned(true);
          if (code === inputVal) {
            setIsSuccess(true);
            setCount((prevState) => prevState + 1);
          } else {
            setIsSuccess(false);
          }
        }

        navigator.vibrate(200);
      }
    },
    [isScanned, inputVal, isFixed]
  );

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target:  webcamRef.current,
         constraints: {
             facingMode: "environment",
             deviceId: deviceId
         },
        },
        frequency: 400,
        decoder: {
          readers: ["code_128_reader"], // Specify the type of barcode you want to scan, for example: EAN-13
          singleScan: false,
          debug: {
              drawBoundingBox: false,
              showFrequency: false,
              drawScanline: false,
              showPattern: false
          }
        },
        numOfWorkers: 1,
        debug: false,
        locate: true,
      },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      }
    );

    return () => {
      Quagga.stop();
    };
  }, []);

  useEffect(() => {
    Quagga.onDetected(handleDetect);

    return () => {
      Quagga.offDetected(handleDetect);
    };
  }, [handleDetect]);

  const onCopy = () => {
    navigator.clipboard.writeText(scannedCode);
  };

  const onTransfer = () => {
    setInputVal(scannedCode);
  };

  const onChange = (e) => {
    console.log(e.target.value);
    setDeviceId(e.target.value);
  };
  useEffect(() => {
    // navigator.mediaDevices.getUserMedia().then((r) => {
    //   console.log(r);
    // });
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div>
      <h1>Сканер штрих-кодов {count}</h1>
      <select value={deviceId} onChange={onChange}>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
      <div ref={webcamRef} className={cls.video}>
      </div>

      <div className={cls.block}>
        <p className={cls.text}>
          Сканированный код: <br /> {scannedCode}
        </p>
        <button className={cls.copy} onClick={onCopy}>
          Copy
        </button>
        <button className={cls.copy} onClick={onTransfer}>
          Transfer
        </button>
      </div>
      <div className={cls.input}>
        <input
          type="text"
          ref={inputRef}
          value={inputVal}
          disabled={isFixed}
          onInput={(e) => setInputVal(e.target.value)}
        />
        <button onClick={() => setIsFixed(!isFixed)}>
          {isFixed ? "Изменить" : "Зафиксировать"}
        </button>
      </div>
      {isScanned && (
        <div onClick={() => setIsScanned(false)} className={cls.modal_wrapper}>
          <div className={cls.modal_content}>
            <img className={cls.img} src={isSuccess ? success : error} alt="" />
            <div
              className={classNames(
                cls.text1,
                isSuccess ? cls.success : cls.error
              )}
            >
              {isSuccess ? "Совпадает" : `${inputVal} != ${scannedCode}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
