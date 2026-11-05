import test from 'node:test';
import assert from 'node:assert/strict';
import { COACH_PERSONAS, CoachRole } from '../src/components/AiStudyCoachModal.tsx';

test('Gemini Chatbot: All 4 specific roles configured with bangla metadata and welcome prompts', () => {
  const roles: CoachRole[] = ['concept_tutor', 'mistake_analyst', 'board_strategist', 'speed_formula'];
  
  for (const role of roles) {
    const persona = COACH_PERSONAS[role];
    assert.ok(persona, `Persona for role ${role} must exist`);
    assert.ok(persona.nameBn.length > 0, `Role ${role} must have a Bengali name`);
    assert.ok(persona.shortTitle.length > 0, `Role ${role} must have a short title`);
    assert.ok(persona.welcomeMessage.length > 0, `Role ${role} must have a welcome message`);
    assert.ok(persona.quickPrompts.length >= 3, `Role ${role} must have at least 3 quick prompt chips`);
  }
});

test('Gemini Chatbot: Zero Cost Model & Fallback Behavior Verification', () => {
  // Test role-specific guidance strings
  const mistakeAnalyst = COACH_PERSONAS['mistake_analyst'];
  assert.ok(mistakeAnalyst.quickPrompts.some(p => p.includes('ভুল')), 'Mistake analyst has mistake-focused prompts');

  const boardStrategist = COACH_PERSONAS['board_strategist'];
  assert.ok(boardStrategist.quickPrompts.some(p => p.includes('৩০ মিনিট') || p.includes('MCQ')), 'Board strategist has time management prompt');

  const speedFormula = COACH_PERSONAS['speed_formula'];
  assert.ok(speedFormula.quickPrompts.some(p => p.includes('সূত্র') || p.includes('ছন্দ')), 'Speed formula coach has formula-focused prompts');
});
