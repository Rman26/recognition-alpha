import React, { useState } from 'react';
import AWS, { AWSError } from 'aws-sdk';
import { DetectFacesResponse, ImageBlob } from 'aws-sdk/clients/rekognition';
import './App.css';


export default function App() {
  const [image, setImage] = useState<any>();
  const [result, setResult] = useState<any>();

  function DetectFaces(imageData: Blob | ArrayBuffer) {
    AWS.config.region = process.env.REACT_APP_REGION;
    var rekognition = new AWS.Rekognition();
    var params = {
      Image: {
        Bytes: imageData as ImageBlob
      },
      Attributes: [
        'ALL',
      ]
    };
    rekognition.detectFaces(params, function (err:AWSError, data:DetectFacesResponse) {
      if (err) console.log(err,err.stack)
      else {
        setResult(data.FaceDetails);
      }
    });
  }
  function ProcessImage(e: React.ChangeEvent<HTMLInputElement>) {
    AnonLog();
    var file = e.target.files![0];
    setImage(URL.createObjectURL(file))

    var reader = new FileReader();
    reader.onload = (function (theFile) {
      return function (e: any) {
        var img = document.createElement('img');
        var image = null;
        img.src = e.target?.result;
        var jpg = true;
        try {
          image = atob(e.target.result.split("data:image/jpeg;base64,")[1]);

        } catch (e) {
          jpg = false;
        }
        if (jpg === false) {
          try {
            image = atob(e.target.result.split("data:image/png;base64,")[1]);
          } catch (e) {
            alert("Not an image file Rekognition can process");
            return;
          }
        }
        if (!image) {
          return;
        }
        var length = image.length;
        var imageBytes = new ArrayBuffer(length);
        var ua = new Uint8Array(imageBytes);
        for (var i = 0; i < length; i++) {
          ua[i] = image?.charCodeAt(i);
        }
        //Call Rekognition  
        DetectFaces(imageBytes);
      };
    })(file);
    reader.readAsDataURL(file);
  }

  function AnonLog() {
    // Configure the credentials provider to use your identity pool
    AWS.config.region = process.env.REACT_APP_REGION; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: process.env.REACT_APP_POOL_ID as string,
    });
  }
  console.log(result[0])
  return (
    <section className='container'>
        <h1>Reconnaissance facial</h1>
        <div className='mb-3'>
          <input className='form-control' type='file' id='formFile'  onChange={(e) =>
            ProcessImage(e)
          } />
        </div>
      <div className='row'>
        <div className='col-6'>
          <img src={image} className='imageStyle' alt='' />
        </div>
        <div className='col-6 result'>
          <h5>AgeRange<span>{result!==undefined && result[0].AgeRange.Low} - {result!==undefined && result[0].AgeRange.High}</span></h5>

          <h5> Gender<span>: {result!==undefined && result[0].Gender.Value}</span></h5>

          <h5>{result!== undefined && result[0].Emotions[0].Type}<span> : {result[0].Emotions[0].Confidence}</span></h5>
          <h5>{result!== undefined && result[0].Emotions[1].Type}<span> : {result[0].Emotions[1].Confidence}</span></h5>
          <h5>{result!== undefined && result[0].Emotions[2].Type}<span> : {result[0].Emotions[2].Confidence}</span></h5>
          <h5>{result!== undefined && result[0].Emotions[3].Type}<span> : {result[0].Emotions[3].Confidence}</span></h5>
          <h5>{result!== undefined && result[0].Emotions[4].Type}<span> : {result[0].Emotions[4].Confidence}</span></h5>
          <h5>{result!== undefined && result[0].Emotions[5].Type}<span> : {result[0].Emotions[5].Confidence}</span></h5>
          <h5>{result!== undefined && result[0].Emotions[6].Type}<span> : {result[0].Emotions[6].Confidence}</span></h5>
          <h5>{result!== undefined && result[0].Emotions[7].Type}<span> : {result[0].Emotions[7].Confidence}</span></h5>
        </div>
      </div>
    </section>
  );
}
