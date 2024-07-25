"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {Document, Page, pdfjs} from 'react-pdf';
import React, {useState} from 'react';

// WE need to configure CORS
// gsutil cors set cors.json gs://translate-ai-files.appspot.com
// gsutil cors set cors.json gs://rookas-ai-translation.appspot.com
// go here >>> https://console.cloud.google.com/
// create new file in editor calls cors.json
// run >>> // gsutil cors set cors.json gs://rookas-ai-translation.appspot.com
// https://firebase.google.com/docs/storage/web/download-files#cors_configuration

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFView = ({url}: { url: string }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);


  return (
    <div>

    </div>
  );
};

export default PDFView;
// by Rokas with ❤️
