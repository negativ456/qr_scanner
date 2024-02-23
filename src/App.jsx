import React , {useState , useEffect , useCallback} from 'react';
import Quagga from 'quagga';
import Webcam from 'react-webcam';

const BarcodeScanner = () => {
  const [scannedCode, setScannedCode] = useState('');
  const webcamRef = React.useRef(null);
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    (mediaDevices) => {
      const devices = mediaDevices.filter(({ kind }) => kind === "videoinput");
      setDevices(devices);
      setDeviceId(
        devices.length > 1 ? devices[1].deviceId : devices[0].deviceId
      );
    },
    [setDevices]
  );

  useEffect(() => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: webcamRef.current.video,
      },
      decoder: {
        readers: ["code_128_reader"], // Specify the type of barcode you want to scan, for example: EAN-13
        singleScan: false
      },
      locate: true,
      debug: {
        drawBoundingBox: true,
        showFrequency: true,
        drawScanline: true,
        showPattern: true
      }
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
      Quagga.onDetected(handleDetected);
    });

    return () => {
      Quagga.stop();
    };
  }, []);

  const handleDetected = (result) => {
    setScannedCode(result.codeResult.code);
    console.log (result)

  };

  useEffect(() => {
    // navigator.mediaDevices.getUserMedia().then((r) => {
    //   console.log(r);
    // });
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div>
      <h1>Сканер штрих-кодов</h1>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          autoFocus={true}
          videoConstraints={{ deviceId }}
          width="100%"
          height="auto"
        />
      </div>
      <div>
        <p>Сканированный код: {scannedCode}</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
