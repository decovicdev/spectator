import React from "react";

import { useHistory, useParams } from "react-router-dom";

import DocumentViewer from "document-viewer";
import "document-viewer/dist/style.css";

import { Document as DocumentType } from "../../types";

type DocumentProps = {
  documents: DocumentType[];
};

const Document = (props: DocumentProps) => {
  const { documents } = props;

  const [document, setDocument] = React.useState<any>(null);
  const [annotations, setAnnotations] = React.useState<any>([]);

  const history = useHistory();
  const { id } = useParams();

  React.useEffect(() => {
    async function fetchDocument() {
      let response = await fetch("/document/" + id);
      let doc = await response.json();
      setDocument(doc);
    }

    fetchDocument();
  }, [id]);

  React.useEffect(() => {
    async function fetchAnnotations() {
      let response = await fetch("/document/" + id + "/annotations");
      let anns = await response.json();
      console.log("Anns:", anns);
      setAnnotations(anns);
    }

    fetchAnnotations();
  }, [id]);

  const nextDocumentId = React.useMemo(() => {
    if (!id) return null;

    let documentId = parseInt(id);
    let index = documents.findIndex((document: DocumentType) => document.id === documentId);
    
    let nextDocumentIndex = index + 1;

    return nextDocumentIndex >= 0 && nextDocumentIndex < documents.length ? documents[nextDocumentIndex].id : null;
  }, [id, documents]);

  const previousDocumentId = React.useMemo(() => {
    if (!id) return null;

    let documentId = parseInt(id);
    let index = documents.findIndex((document: DocumentType) => document.id === documentId);
    
    let previousDocumentIndex = index - 1;

    return previousDocumentIndex >= 0 && previousDocumentIndex < documents.length ? documents[previousDocumentIndex].id : null;
  }, [id, documents]);

  const handleAnnotationCreate = React.useCallback((annotation: any) => {
    // TODO: CHANGE THAT
    annotation.topicId = 1;
    
    fetch("/document/" + document.id + "/annotations", {
        method: "post",
        body: JSON.stringify(annotation)
      }).then((response: any) => {
        console.log("Annotation created:", response);
      }).catch((error: any) => {
        console.error("Annotation create:", error);
      });
  }, [document]);

  return (
    <div className="Document">
      {document && 
        <DocumentViewer 
          annotations={annotations}
          name={document?.name}
          onAnnotationCreate={handleAnnotationCreate}
          onAnnotationDelete={() => console.log("Delete")}
          onClose={() => history.push("/")}
          onNextDocument={() => nextDocumentId && history.push("/document/" + nextDocumentId)}
          onPreviousDocument={() => previousDocumentId && history.push("/document/" + previousDocumentId)}
          pages={document?.pages}
          topics={["a", "b", "c", "d"]}
        />
      }
    </div>
  );
};

export default Document;