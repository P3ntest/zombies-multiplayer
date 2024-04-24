import { FullScreenStage } from "../components/graphics/FullScreenStage";
import { EditorCamera } from "./EditorCamera";

export function MapEditor() {
  return (
    <div>
      <FullScreenStage>
        <EditorCamera>
          <VisualObjectsEditor />
        </EditorCamera>
      </FullScreenStage>
    </div>
  );
}

function VisualObjectsEditor() {}
