import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { ExamSetupPage } from '../src/components/ExamSetupPage.tsx';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
function label(node: any): string { return node.children.map((x:any)=>typeof x==='string'?x:label(x)).join(''); }
test('quick exam forwards exact count and structured board/year filters',async t=>{
  let renderer:any;const configs:any[]=[];
  await act(async()=>{renderer=create(<ExamSetupPage lang="bn" onBack={()=>{}} onStartExam={async c=>{configs.push(c);return {success:true};}}/>);});
  t.after(async()=>{await act(async()=>renderer.unmount());});
  const root=renderer.root;
  await act(async()=>root.findByProps({'aria-label':'Board'}).props.onChange({target:{value:'ঢাকা'}}));
  await act(async()=>root.findByProps({'aria-label':'Year'}).props.onChange({target:{value:'2024'}}));
  const buttons=()=>root.findAllByType('button');
  for(const count of [10,20,30,35,50,100]){
    const button=buttons().find((b:any)=>label(b)===`${count} টি`);assert.ok(button,`count ${count} available`);
    await act(async()=>button.props.onClick());
    await act(async()=>buttons().find((b:any)=>label(b).includes('সরাসরি পরীক্ষা শুরু করুন')).props.onClick());
    assert.equal(configs.at(-1).count,count);assert.equal(configs.at(-1).board,'ঢাকা');assert.equal(configs.at(-1).year,'2024');
  }
});
test('quick-start insufficiency is visible and zero-question partial start is disabled',async t=>{
  let renderer:any;
  await act(async()=>{renderer=create(<ExamSetupPage lang="bn" onBack={()=>{}} onStartExam={async()=>({success:false,error:'insufficient_questions',availableCount:0,requestedCount:20})}/>);});
  t.after(async()=>{await act(async()=>renderer.unmount());});
  await act(async()=>renderer.root.findAllByType('button').find((b:any)=>label(b).includes('সরাসরি পরীক্ষা শুরু করুন')).props.onClick());
  const partial=renderer.root.findAllByType('button').find((b:any)=>label(b).includes('উপলব্ধ 0টি প্রশ্ন'));
  assert.ok(partial);assert.equal(partial.props.disabled,true);
});

