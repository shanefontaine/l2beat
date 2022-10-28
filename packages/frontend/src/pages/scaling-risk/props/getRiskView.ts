import { Layer2 } from '@l2beat/config'
import { VerificationStatus } from '@l2beat/types'

import {
  ScalingRiskViewEntry,
  ScalingRiskViewProps,
} from '../view/ScalingRiskView'

export function getRiskView(
  projects: Layer2[],
  verificationStatus: VerificationStatus,
): ScalingRiskViewProps {
  return {
    items: projects.map((p) =>
      getRiskViewEntry(p, verificationStatus.projects[p.id.toString()]),
    ),
  }
}

export function getRiskViewEntry(
  project: Layer2,
  verificationStatus: boolean,
): ScalingRiskViewEntry {
  return {
    name: project.display.name,
    slug: project.display.slug,
    provider: project.technology.provider,
    warning: project.display.warning,
    verificationStatus,
    ...project.riskView,
  }
}
