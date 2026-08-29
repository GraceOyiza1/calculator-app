import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const calcSchema = z.object({
  leadId: z.string().uuid('Invalid lead ID'),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  materialType: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = calcSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { leadId, length, width, height, materialType } = result.data;

    // 1. Verify Lead Exists (Gating check)
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 403 });
    }

    // 2. Fetch Pricing Data server-side
    const spec = await prisma.packagingSpec.findUnique({
      where: { materialType },
    });

    if (!spec) {
      return NextResponse.json({ error: 'Material type not found' }, { status: 404 });
    }

    // 3. Perform Calculations
    const volumeCuIn = length * width * height;
    const dimWeightLbs = volumeCuIn / spec.dimensionalDivisor;
    
    // Calculate approximate surface area for the blank
    const blankAreaSqFt = (length * width * 2 + width * height * 2 + length * height * 2) / 144;
    
    const estimatedMaterialCost = blankAreaSqFt * spec.costPerSqFt;

    // 4. Return computed outputs (NO proprietary multiplier/vectors exposed)
    return NextResponse.json({
      dimWeightLbs: dimWeightLbs.toFixed(2),
      estimatedMaterialCost: estimatedMaterialCost.toFixed(2),
      blankAreaSqFt: blankAreaSqFt.toFixed(2),
    }, { status: 200 });

  } catch (error) {
    console.error('Error calculating Pack IQ:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
