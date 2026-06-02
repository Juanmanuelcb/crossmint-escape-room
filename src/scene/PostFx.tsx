import * as React from 'react'
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing'

interface PostFxProps {
  darkness: number
}

export const PostFx: React.FC<PostFxProps> = ({ darkness }) => (
  <EffectComposer>
    <Bloom
      intensity={0.7}
      luminanceThreshold={0.7}
      luminanceSmoothing={0.2}
      mipmapBlur
    />
    <Vignette darkness={darkness} offset={0.3} />
    <Noise opacity={0.04} />
    <ChromaticAberration offset={[0.0004, 0.0004]} />
  </EffectComposer>
)
