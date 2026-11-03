import test from 'node:test';
import assert from 'node:assert/strict';
import { MockRepository } from '../dist/data.js';

test('검표 미완료 및 충돌 세이브는 탑승을 거부한다', () => {
  const repo = new MockRepository();
  for (const id of ['S-1847', 'S-1846', 'S-1844']) {
    assert.throws(() => repo.act(id, 'board'), /검표 통과/);
  }
  assert.equal(repo.act('S-1848', 'board').status, '배포 대기');
  assert.equal(repo.act('S-1848', 'unboard').status, '탑승 가능');
});

test('순서 조정과 재검표는 미해결 충돌을 해제하지 않는다', () => {
  const repo = new MockRepository();
  repo.act('S-1846', 'order');
  repo.act('S-1846', 'hold');
  repo.act('S-1846', 'recheck');
  assert.equal(repo.get('S-1846').status, '보류');
  assert.equal(repo.get('S-1846').conflict.resolved, false);
  assert.equal(repo.act('S-1846', 'resume').status, '충돌');
  assert.match(repo.syncBranch(), /동기화 보류/);
});

test('체험 초기화는 원래 상태와 빈 조작 기록을 복원한다', () => {
  const repo = new MockRepository();
  repo.act('S-1848', 'board');
  repo.reset();
  assert.equal(repo.get('S-1848').status, '탑승 가능');
  assert.deepEqual(repo.events, []);
});
