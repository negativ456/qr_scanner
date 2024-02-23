import React, { useState, useEffect } from 'react';
import Quagga from 'quagga';
import Webcam from 'react-webcam';

const BarcodeScanner = () => {
  const [scannedCode, setScannedCode] = useState('');
  const webcamRef = React.useRef(null);

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
      frequency: 100
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

  return (
    <div>
      <h1>Сканер штрих-кодов</h1>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
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
