import React from "react";

import { Box, Button } from "@mui/material";

import AnnotationLabel from "./ui/AnnotationLabel";

import { IndexedAnnotation } from "./types";

export const MAX_ANNOTATION_LABELS_TO_SHOW = 5;
export const MORE_BUTTON_HEIGHT = 20;
const ANNOTATION_LABEL_LEFT_OFFSET = -18;

export type AnnotationsGroup = {
  top: number;
  bottom: number;
  annotations: IndexedAnnotation[];
};

type AnnotationsGroupProps = {
  annotationsGroup: AnnotationsGroup;
  focusedAnnotationIndex: number;
  focusingAnnotation: boolean;
  onAnnotationDelete?: (annotation: IndexedAnnotation) => void;
  onAnnotationFocus: (annotationIndex: number) => void;
};

export const AnnotationsGroup = (props: AnnotationsGroupProps): JSX.Element => {
  const {
    annotationsGroup,
    focusedAnnotationIndex,
    focusingAnnotation,
    onAnnotationDelete,
    onAnnotationFocus,
  } = props;

  const groupRef = React.useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = React.useState(false);

  const annotationsToShow = React.useMemo(() => {
    const annotations = annotationsGroup.annotations;

    if (expanded) return annotations;

    // Focused annotation is hidden
    if (
      focusingAnnotation &&
      annotations
        .slice(MAX_ANNOTATION_LABELS_TO_SHOW)
        .find((annotation: IndexedAnnotation) => annotation._index === focusedAnnotationIndex)
    )
      return annotations;

    return annotations.slice(0, MAX_ANNOTATION_LABELS_TO_SHOW);
  }, [annotationsGroup.annotations, expanded, focusedAnnotationIndex, focusingAnnotation]);

  const handleClickOutside = React.useCallback(
    (event: Event) => {
      if (!groupRef || !groupRef.current) return;

      const targetElement = event.target as Element;
      if (groupRef.current.contains(targetElement)) return;

      setExpanded(false);
      document.getElementsByClassName("Pages")[0].removeEventListener("click", handleClickOutside);
    },
    [setExpanded]
  );

  const handleMoreButtonClick = React.useCallback(() => {
    setExpanded(true);
    document.getElementsByClassName("Pages")[0].addEventListener("click", handleClickOutside);
  }, [handleClickOutside, setExpanded]);

  return (
    <Box
      ref={groupRef}
      sx={{
        position: "absolute",
        top: annotationsGroup.top,
      }}
    >
      {annotationsToShow.map((annotation: IndexedAnnotation, annotationKey: number) => (
        <AnnotationLabel
          key={annotationKey}
          style={{
            marginLeft:
              focusingAnnotation && annotation._index === focusedAnnotationIndex
                ? ANNOTATION_LABEL_LEFT_OFFSET + "px"
                : "0",
            transition: "0.2s ease-in-out",
          }}
          onClick={(event: React.MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            onAnnotationFocus(annotation._index);
          }}
          onDelete={
            onAnnotationDelete
              ? (event: React.MouseEvent): void => {
                  event.preventDefault();
                  event.stopPropagation();
                  onAnnotationDelete(annotation);
                }
              : undefined
          }
          topic={annotation.topic}
        />
      ))}
      {annotationsToShow.length < annotationsGroup.annotations.length && (
        <Button
          variant="contained"
          disableElevation
          onClick={handleMoreButtonClick}
          sx={{
            width: "100%",
            height: `${MORE_BUTTON_HEIGHT}px`,
            borderRadius: 0,
            marginTop: "-3px",
          }}
        >
          More
        </Button>
      )}
    </Box>
  );
};
