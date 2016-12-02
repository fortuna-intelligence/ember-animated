import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { equalBounds } from '../../helpers/assertions';
import Motion from 'ember-animated/motion';
import { task, timeout } from 'ember-concurrency';


moduleForComponent('animated-container', 'Integration | Component | animated container', {
  integration: true,
  beforeEach(assert) {
    assert.equalBounds = equalBounds;
    let here = this;
    this.inject.service('-ea-motion', { as: 'motionService' });
    this.register('component:grab-container', Ember.Component.extend({
      didReceiveAttrs() {
        here.set('grabbed', this.get('cont'));
      }
    }));
  }
});

test('simple render', function(assert) {
  this.render(hbs`
    {{#animated-container as |container|}}
      <div class="inside">
        {{grab-container cont=container}}
      </div>
    {{/animated-container}}
  `);

  this.$('.inside').css({
    height: 210
  });

  let container = bounds(this.$('.animated-container'));
  let inside = bounds(this.$('.inside'));
  assert.equalBounds(container, inside, 'takes size of content');

  this.$('.inside').css({
    height: 600
  });

  container = bounds(this.$('.animated-container'));
  let tallerInside = bounds(this.$('.inside'));
  assert.equalBounds(container, tallerInside, 'adapts to height of content');
  assert.ok(tallerInside.height > inside.height, "inside content got taller");

});

test('locks size', function(assert) {
  this.render(hbs`
    {{#animated-container as |container|}}
      <div class="inside">
        {{grab-container cont=container}}
      </div>
    {{/animated-container}}
  `);

  this.$('.inside').css({
    height: 210
  });

  let original = bounds(this.$('.animated-container'));

  this.get('grabbed.lock')();

  this.$('.inside').css({
    height: 600
  });

  let final = bounds(this.$('.animated-container'));

  assert.equalBounds(final, original, 'height can be locked');
});

test('measures at the appropriate time', function(assert) {
  let insideBounds;
  let motionSawHeight;

  this.set('TestMotion', Motion.extend({
    animate: task(function * () {
      motionSawHeight = this.sprite.finalBounds.height;
    })
  }));

  this.render(hbs`
    {{#animated-container motion=TestMotion as |container|}}
      <div class="inside">
        {{grab-container cont=container}}
      </div>
    {{/animated-container}}
  `);

  this.$('.inside').css({
    height: 210
  });

  this.get('grabbed.lock')();

  // Deliberately waiting a bit to make sure the container doesn't
  // jump the gun and measure too soon.
  return timeout(10).then(() => {

    this.$('.inside').css({
      height: 600
    });

    insideBounds = bounds(this.$('.inside'));

    this.get('grabbed.measure')();
    this.get('grabbed.unlock')();
    return this.get('motionService.waitUntilIdle').perform();
  }).then(() => {
    assert.equal(motionSawHeight, insideBounds.height);
  });
});

skip('unlocks only after motion is done', function() {

});

skip('unlocks only after unlock message is received');


skip("Accounts for margin collapse between self and child");
skip("Accounts for margin collapse between own margins when becoming empty");

function bounds($elt) {
  return $elt[0].getBoundingClientRect();
}
