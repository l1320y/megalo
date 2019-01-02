import { compileToTemplate } from 'mp/compiler'
import tagMap from '../helpers/tag-map'
import { slotName } from '../helpers'

const CompA = {
  name: 'CompA$1234',
  src: './CompA$1234'
}

const CompB = {
  name: 'CompB$1234',
  src: './CompB$1234'
}

const options = {
  name: 'App$1234',
  imports: {
    CompA,
    CompB
  },
  htmlParse: {
    templateName: 'octoParse'
  }
}

function wrapHtml (code) {
  return `<div>${code}</div>`
}

function wrapMP (code, options = {}) {
  const { name = 'defaultName' } = options
  return (
    `<template name="${name}">` +
      `<view class="_div {{ h[ 0 ].rcl }} {{d}}">${code}</view>` +
    `</template>`
  )
}

function assertCodegen (body, assertTemplate, options = {}, callback) {
  Object.assign(options, {
    target: 'alipay'
  })

  const template = wrapHtml(body, options)
  const output = compileToTemplate(template, options)

  expect(output.body).toEqual(wrapMP(assertTemplate, options))

  typeof callback === 'function' && callback(output)
  // expect(JSON.stringify(output.slots)).toEqual(JSON.stringify(slots))
  // expect(output.code.replace(/\n/g, '')).toMatch(strToRegExp(assertTemplate))
}

describe('compilteToTemplate: alipay', () => {
  const baseTagList = Object.keys(tagMap)
    .map(k => ({
      html: k,
      mp: tagMap[k]
    }))
    .filter(tag => tag.html !== 'template' && tag.html !== 'script' && tag.html !== 'br')

  it(`generate base tag`, () => {
    baseTagList.forEach((tag) => {
      const htmlTag = tag.html
      const mpTag = tag.mp
      assertCodegen(
        `<${htmlTag}></${htmlTag}>`,
        `<${mpTag} class="_${htmlTag} {{d}}"></${mpTag}>`
      )
    })
  })

  it('static text', () => {
    assertCodegen(
      `<div>static text</div>`,
      `<view class="_div {{d}}">static text</view>`,
    )

    assertCodegen(
      `<div>static text with &lt;</div>`,
      `<view class="_div {{d}}">static text with {{"<"}}</view>`,
    )

    assertCodegen(
      `<div>static text with <</div>`,
      `<view class="_div {{d}}">static text with {{"<"}}</view>`,
    )

    assertCodegen(
      `<div>static text with ~\`!@#$%^&*()_+={}[]>,./?</div>`,
      `<view class="_div {{d}}">static text with ~\`!@#$%^&*()_+={}[]>,./?</view>`,
    )

    assertCodegen(
      `<div>{{ title }}<div>{{ info.name }}</div></div>`,
      `<view class="_div {{d}}">{{ h[ 2 ].t }}<view class="_div {{d}}">{{ h[ 4 ].t }}</view></view>`,
    )

    assertCodegen(
      `<div>head {{ title }} tail</div>`,
      `<view class="_div {{d}}">{{ h[ 2 ].t }}</view>`,
    )
  })

  // class
  it('generate class', () => {
    assertCodegen(
      `<div class=""></div>`,
      `<view class="_div {{d}}"></view>`
    )
    assertCodegen(
      `<div class="app"></div>`,
      `<view class="_div app {{d}}"></view>`
    )
    assertCodegen(
      `<div :class="{ show: true }"></div>`,
      `<view class="_div {{ h[ 1 ].cl }} {{d}}"></view>`
    )
    assertCodegen(
      `<div :class="[ showClass ]"></div>`,
      `<view class="_div {{ h[ 1 ].cl }} {{d}}"></view>`
    )
    assertCodegen(
      `<div class="app" :class="[ showClass ]"></div>`,
      `<view class="_div app {{ h[ 1 ].cl }} {{d}}"></view>`
    )
    assertCodegen(
      `<div class="app"></div>`,
      `<view class="_div app {{d}}"></view>`,
      { scopeId: 'v-2333' }
    )
    assertCodegen(
      `<div :class="[ showClass ]"></div>`,
      `<view class="_div {{ h[ 1 ].cl }} {{d}}"></view>`,
      { scopeId: 'v-2333' }
    )
    assertCodegen(
      `<div class="app" :class="[ showClass ]"></div>`,
      `<view class="_div app {{ h[ 1 ].cl }} {{d}}"></view>`,
      { scopeId: 'v-2333' }
    )
  })

  it('generate style', () => {
    assertCodegen(
      `<div style="height: 10px"></div>`,
      `<view class="_div {{d}}" style="height:10px"></view>`
    )
    assertCodegen(
      `<div :style="{ backgroundColor: 'red' }"></div>`,
      `<view class="_div {{d}}" style="{{ h[ 1 ].st }}"></view>`
    )
    assertCodegen(
      `<div style="height: 10px" :style="{ backgroundColor: 'red' }"></div>`,
      `<view class="_div {{d}}" style="height:10px; {{ h[ 1 ].st }}"></view>`
    )
  })

  it('generate attributes', () => {
    assertCodegen(
      `<div disable></div>`,
      `<view class="_div {{d}}" disable="true"></view>`
    )
    assertCodegen(
      `<div disable=""></div>`,
      `<view class="_div {{d}}" disable="true"></view>`
    )
    assertCodegen(
      `<div disable="false"></div>`,
      `<view class="_div {{d}}" disable="false"></view>`
    )
    assertCodegen(
      `<div data-store="123"></div>`,
      `<view class="_div {{d}}" data-store="123"></view>`
    )
    assertCodegen(
      `<div :data-store="store"></div>`,
      `<view class="_div {{d}}" data-store="{{ h[ 1 ][ 'data-store' ] }}"></view>`
    )
    assertCodegen(
      `<div :data-store="true"></div>`,
      `<view class="_div {{d}}" data-store="{{ h[ 1 ][ 'data-store' ] }}"></view>`
    )
  })

  it('generate events', () => {
    assertCodegen(
      `<div @click="onClick"></div>`,
      `<view class="_div {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onTap="_pe"></view>`
    )
    assertCodegen(
      `<scoll-view @scrolltoupper="onScollToUpper"></scoll-view>`,
      `<scoll-view class="_scoll-view {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onScrollToUpper="_pe"></scoll-view>`
    )
    assertCodegen(
      `<scoll-view @scroll="onScroll" @scrolltoupper="onScollToUpper"></scoll-view>`,
      `<scoll-view class="_scoll-view {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onScroll="_pe" onScrollToUpper="_pe"></scoll-view>`
    )
    assertCodegen(
      `<input @change="onInput">`,
      `<input class="_input {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onBlur="_pe"></input>`
    )
    assertCodegen(
      `<textarea @change="onInput"></textarea>`,
      `<textarea class="_textarea {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onBlur="_pe"></textarea>`
    )
    // .stop
    assertCodegen(
      `<div @click.stop="onClick"></div>`,
      `<view class="_div {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" catchTap="_pe"></view>`
    )
    // // .captrue
    // assertCodegen(
    //   `<div @click.capture="onClick"></div>`,
    //   `<view class="_div {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" capture-bindtap="_pe"></view>`
    // )
    // // .capture.stop
    // assertCodegen(
    //   `<div @click.capture.stop="onClick"></div>`,
    //   `<view class="_div {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" capture-catchtap="_pe"></view>`
    // )
    // .once
    assertCodegen(
      `<div @click.once="onClick"></div>`,
      `<view class="_div {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onTap="_pe"></view>`
    )
  })

  it('generate v-if', () => {
    assertCodegen(
      `<div v-if="code === 200"></div>`,
      `<view a:if="{{ h[ 1 ]._if }}" class="_div {{d}}"></view>`
    )
    assertCodegen(
      (
        `<div v-if="code === 200"></div>` +
        `<div v-else></div>`
      ),
      (
        `<view a:if="{{ h[ 1 ]._if }}" class="_div {{d}}"></view>` +
        `<view a:else class="_div {{d}}"></view>`
      )
    )
    assertCodegen(
      (
        `<div v-if="code < 200">{{ code }}</div>` +
        `<div v-else-if="code < 400">{{ code }}</div>`
      ),
      (
        `<view a:if="{{ h[ 1 ]._if }}" class="_div {{d}}">{{ h[ 2 ].t }}</view>` +
        `<view a:elif="{{ h[ 3 ]._if }}" class="_div {{d}}">{{ h[ 4 ].t }}</view>`
      )
    )
    assertCodegen(
      (
        `<div v-if="code < 200">{{ code }}</div>` +
        `<div v-else-if="code < 400">{{ code }}</div>` +
        `<div v-else>{{ code }}</div>`
      ),
      (
        `<view a:if="{{ h[ 1 ]._if }}" class="_div {{d}}">{{ h[ 2 ].t }}</view>` +
        `<view a:elif="{{ h[ 3 ]._if }}" class="_div {{d}}">{{ h[ 4 ].t }}</view>` +
        `<view a:else class="_div {{d}}">{{ h[ 6 ].t }}</view>`
      )
    )
  })

  // v-for
  it('generate v-for', () => {
    assertCodegen(
      (
        `<div v-for="item in list">` +
          `<div>{{ item.name }}</div>` +
        `</div>`
      ),
      (
        `<view a:for="{{ h[ 1 ].li }}" a:for-item="item" a:for-index="item_i1" class="_div {{d}}">` +
          `<view class="_div {{d}}">{{ h[ 3 + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ].t }}</view>` +
        `</view>`
      )
    )
    assertCodegen(
      (
        `<div v-for="(item, index) in list">` +
          `<div>{{ item.name }}</div>` +
        `</div>`
      ),
      (
        `<view a:for="{{ h[ 1 ].li }}" a:for-item="item" a:for-index="index" class="_div {{d}}">` +
          `<view class="_div {{d}}">{{ h[ 3 + '-' + (item_i2 !== undefined ? item_i2 : index) ].t }}</view>` +
        `</view>`
      )
    )
    assertCodegen(
      (
        `<div v-for="(item, index) in list" :key="item.id">` +
          `<div>{{ item.name }}</div>` +
        `</div>`
      ),
      (
        `<view a:for="{{ h[ 1 ].li }}" a:key="id" a:for-item="item" a:for-index="index" class="_div {{d}}">` +
          `<view class="_div {{d}}">{{ h[ 3 + '-' + (item_i2 !== undefined ? item_i2 : index) ].t }}</view>` +
        `</view>`
      )
    )
    assertCodegen(
      (
        `<div v-for="(item, index) in list" :key="item.id">` +
          `<div v-for="(e, i) in item.list" :key="e.id">` +
            `{{ e.price }}` +
          `</div>` +
        `</div>`
      ),
      (
        `<view a:for="{{ h[ 1 ].li }}" a:key="id" a:for-item="item" a:for-index="index" class="_div {{d}}">` +
          `<view a:for="{{ h[ 2 + '-' + (item_i2 !== undefined ? item_i2 : index) ].li }}" a:key="id" a:for-item="e" a:for-index="i" class="_div {{d}}">` +
            `{{ h[ 3 + '-' + (item_i2 !== undefined ? item_i2 : index) + '-' + (e_i2 !== undefined ? e_i2 : i) ].t }}` +
          `</view>` +
        `</view>`
      )
    )
    assertCodegen(
      (
        `<div v-for="item in list" :key="item.id">` +
          `<div v-for="e in item.list" :key="e.id">` +
            `{{ e.price }}` +
          `</div>` +
        `</div>`
      ),
      (
        `<view a:for="{{ h[ 1 ].li }}" a:key="id" a:for-item="item" a:for-index="item_i1" class="_div {{d}}">` +
          `<view a:for="{{ h[ 2 + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ].li }}" a:key="id" a:for-item="e" a:for-index="e_i1" class="_div {{d}}">` +
            `{{ h[ 3 + '-' + (item_i2 !== undefined ? item_i2 : item_i1) + '-' + (e_i2 !== undefined ? e_i2 : e_i1) ].t }}` +
          `</view>` +
        `</view>`
      )
    )
    assertCodegen(
      (
        `<template v-for="item in list">` +
          `<div :key="item.id">{{ item.name }}</div>` +
        `</template>`
      ),
      (
        `<block a:for="{{ h[ 1 ].li }}" a:for-item="item" a:for-index="item_i1">` +
          `<view a:key="id" class="_div {{d}}">{{ h[ 3 + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ].t }}</view>` +
        `</block>`
      )
    )
  })

  // component
  it('generate component', () => {
    assertCodegen(
      (
        `<CompA :message="count"></CompA>` +
        `<CompB :message="count"></CompB>`
      ),
      (
        `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, _t: _t || '' }}" />` +
        `<template is="${CompB.name}" data="{{ ...$root[ cp + 1 + (_t || '') ], $root, _t: _t || '' }}" />`
      ),
      options
    )
    // should accept PascalCase
    assertCodegen(
      (
        `<comp-a :message="count"></comp-a>` +
        `<comp-b :message="count"></comp-b>`
      ),
      (
        `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, _t: _t || '' }}" />` +
        `<template is="${CompB.name}" data="{{ ...$root[ cp + 1 + (_t || '') ], $root, _t: _t || '' }}" />`
      ),
      options
    )
    assertCodegen(
      (
        `<CompA v-if="show" :message="count"></CompA>` +
        `<CompB v-else :message="count"></CompB>`
      ),
      (
        `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, _t: _t || '' }}" a:if="{{ h[ 1 ]._if }}" />` +
        `<template is="${CompB.name}" data="{{ ...$root[ cp + 1 + (_t || '') ], $root, _t: _t || '' }}" a:else />`
      ),
      options
    )
    assertCodegen(
      (
        `<CompA v-for="item in list" :message="count"></CompA>`
      ),
      (
        `<template is="${CompA.name}"` +
          ` data="{{ ...$root[ cp + 0 + (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ], $root, _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) }}"` +
          ` a:for="{{ h[ 1 ].li }}" a:for-item="item" a:for-index="item_i1"` +
        ` />`
      ),
      options
    )
  })

  // v-show
  it('genrate v-show', () => {
    assertCodegen(
      (
        `<div v-show="count > 50">` +
          `{{ item.name }}` +
        `</div>`
      ),
      (
        `<view hidden="{{ h[ 1 ].vs }}" class="_div {{d}}">` +
          `{{ h[ 2 ].t }}` +
        `</view>`
      )
    )
  })

  it('generate v-model', () => {
    assertCodegen(
      `<input v-model="input">`,
      `<input class="_input {{d}}" value="{{ h[ 1 ].value }}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onInput="_pe"></input>`
    )
    assertCodegen(
      `<input value="otherInput" v-model="input">`,
      `<input class="_input {{d}}" value="{{ h[ 1 ].value }}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onInput="_pe"></input>`
    )
    assertCodegen(
      `<input v-model.lazy="input">`,
      `<input class="_input {{d}}" value="{{ h[ 1 ].value }}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onBlur="_pe"></input>`
    )
    assertCodegen(
      `<input v-model.number="input">`,
      `<input class="_input {{d}}" value="{{ h[ 1 ].value }}" data-cid="{{ _c || c }}" data-hid="{{ 1 }}" onInput="_pe" onBlur="_pe"></input>`
    )
  })

  it('generate v-html', () => {
    assertCodegen(
      (
        `<div v-html="input"></div>`
      ),
      (
        `<template is="octoParse" data="{{ nodes: h[ 1 ].html }}"/>`
      ),
      options,
      function (output) {
        expect(output.needHtmlParse).toBeTruthy()
      }
    )
  })
})

describe('slot', () => {
  it('claim slot default slot', () => {
    const slot1 = slotName('default')
    assertCodegen(
      (
        `<div>` +
          `<slot>default slot</slot>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template name="${slot1}">default slot</template>` +
          `<template is="{{ s_default || '${slot1}' }}" data="{{ ...$root[ c ], $root, _t: _t || '', _c: c }}"/>` +
        `</view>`
      ),
      options
    )
  })

  it('claim slot named slot', () => {
    const slot1 = slotName('head')
    const slot2 = slotName('default')
    const slot3 = slotName('foot')
    assertCodegen(
      (
        `<div>` +
          `<slot name="head">head default slot</slot>` +
          `<slot>default slot</slot>` +
          `<slot name="foot">foot default slot</slot>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template name="${slot1}">head default slot</template>` +
          `<template is="{{ s_head || '${slot1}' }}" data="{{ ...$root[ c ], $root, _t: _t || '', _c: c }}"/>` +
          `<template name="${slot2}">default slot</template>` +
          `<template is="{{ s_default || '${slot2}' }}" data="{{ ...$root[ c ], $root, _t: _t || '', _c: c }}"/>` +
          `<template name="${slot3}">foot default slot</template>` +
          `<template is="{{ s_foot || '${slot3}' }}" data="{{ ...$root[ c ], $root, _t: _t || '', _c: c }}"/>` +
        `</view>`
      ),
      options
    )
  })

  it('define slot snippet', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<template>` +
              `<div>{{ title }}</div>` +
            `</template>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        res.slots.forEach((slot, index) => {
          expect(slot.name).toEqual('default')
          expect(slot.body).toEqual(
            `<template name="${slot.slotName}" parent="${options.name}">` +
              `<view class="_div {{d}}">{{ s[ 6 + _t ].t }}</view>` +
            `</template>`
          )
        })
      }
    )
  })

  it('define named slot snippet', () => {
    const slot1 = slotName('default').replace('$', '_')
    const slot2 = slotName('head').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `default 1` +
            `<p slot="head">` +
              `<span>{{ title }}</span>` +
            `</p>` +
            `default 2` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', s_head: '${slot2}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(2)
        res.slots.forEach((slot, index) => {
          if (slot.name === 'head') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<view class="_p {{d}}">` +
                  `<label class="_span {{d}}">{{ s[ 7 + _t ].t }}</label>` +
                `</view>` +
              `</template>`
            )
          } else if (slot.name === 'default') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `default 1` +
                `default 2` +
              `</template>`
            )
          }
        })
      }
    )
  })

  it('default slot should use fallback content if has only whitespace', () => {
    const slot1 = slotName('first').replace('$', '_')
    const slot2 = slotName('second').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<div slot="first">1</div> <div slot="second">2</div> <div slot="second">2+</div>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_first: '${slot1}', s_second: '${slot2}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(2)
        res.slots.forEach((slot, index) => {
          if (slot.name === 'first') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<view class="_div {{d}}">1</view>` +
              `</template>`
            )
          } else if (slot.name === 'second') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<view class="_div {{d}}">2</view>` +
                `<view class="_div {{d}}">2+</view>` +
              `</template>`
            )
          }
        })
      }
    )
  })

  it('define embedded slot snippet', () => {
    // const slotName1 =
    slotName('default').replace('$', '_')
    const slotName2 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<div>` +
              `<CompB>` +
                `<div>{{ title }}</div>` +
              `</CompB>` +
            `</div>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slotName2}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(2)

        const slot1 = res.slots[0]
        const slot2 = res.slots[1]

        expect(slot1.dependencies.length).toEqual(0)
        expect(slot1.body).toEqual(
          `<template name="${slot1.slotName}" parent="${options.name}">` +
            `<view class="_div {{d}}">{{ s[ 8 + _t ].t }}</view>` +
          `</template>`
        )

        expect(slot2.dependencies.length).toEqual(1)
        expect(slot2.dependencies[0]).toEqual(CompB.name)
        expect(slot2.body).toEqual(
          `<template name="${slot2.slotName}" parent="${options.name}">` +
            `<view class="_div {{d}}">` +
              `<template is="${CompB.name}" data="{{ ...$root[ cp + 1 + (_t || '') ], $root, s_default: '${slot1.slotName}', _t: _t || '' }}" />` +
            `</view>` +
          `</template>`
        )
      }
    )
  })

  it('define slot-scope snippet', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<template slot-scope="slotScope">` +
              `<div>{{ title }}</div>` +
            `</template>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(1)
        res.slots.forEach((slot, index) => {
          if (slot.name === 'default') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<view class="_div {{d}}">{{ s[ 6 + _t ].t }}</view>` +
              `</template>`
            )
          }
        })
      }
    )
  })

  it('define slot-scope snippet with scattered template', () => {
    const slot1 = slotName('b').replace('$', '_')
    const slot2 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<p slot="b">select b</p>` +
            `<span><p slot="b">nested b</p></span>` +
            `<span><p slot="c">nested c</p></span>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_b: '${slot1}', s_default: '${slot2}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(2)
        res.slots.forEach((slot, index) => {
          if (slot.name === 'default') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<label class="_span {{d}}"></label>` +
                `<label class="_span {{d}}"></label>` +
              `</template>`
            )
          } else if (slot.name === 'b') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<view class="_p {{d}}">select b</view>` +
              `</template>`
            )
          }
        })
      }
    )
  })

  it('named slot only match children', () => {
    const slot1 = slotName('default').replace('$', '_')
    const slot2 = slotName('head').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `default 1` +
            `<p slot="head">` +
              `<span>{{ title }}</span>` +
            `</p>` +
            `default 2` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', s_head: '${slot2}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(2)
        res.slots.forEach((slot, index) => {
          if (slot.name === 'head') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<view class="_p {{d}}">` +
                  `<label class="_span {{d}}">{{ s[ 7 + _t ].t }}</label>` +
                `</view>` +
              `</template>`
            )
          } else if (slot.name === 'default') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `default 1` +
                `default 2` +
              `</template>`
            )
          }
        })
      }
    )
  })

  it('should not keep slot name when passed further down (nested)', () => {
    const slot2 = slotName('foo').replace('$', '_')
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA><CompB><span slot="foo">foo</span></CompB></CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(2)
        res.slots.forEach((slot, index) => {
          if (slot.name === 'foo') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<label class="_span {{d}}">foo</label>` +
              `</template>`
            )
          } else if (slot.name === 'default') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<template is="CompB$1234" data="{{ ...$root[ cp + 1 + (_t || '') ], $root, s_foo: '${slot2}', _t: _t || '' }}" />` +
              `</template>`
            )
          }
        })
      }
    )
  })

  it('scoped slot should overwrite nont scoped slot', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA><span slot-scope="foo">foo.bar</span><span>default slot</span></CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(1)
        res.slots.forEach((slot, index) => {
          if (slot.name === 'default') {
            expect(slot.body).toEqual(
              `<template name="${slot.slotName}" parent="${options.name}">` +
                `<label class="_span {{d}}">foo.bar</label>` +
              `</template>`
            )
          }
        })
      }
    )
  })

  it('ignore empty scoped slot', () => {
    assertCodegen(
      (
        `<div>` +
          `<CompA><template slot-scope="foo"></template></CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        expect(res.slots.length).toEqual(0)
      }
    )
  })

  it('slot inside v-for', () => {
    const slot1 = slotName('default')
    assertCodegen(
      (
        `<div>` +
          `<div v-for="item in list">` +
            `<slot></slot>` +
          `</div>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<view a:for="{{ h[ 2 ].li }}" a:for-item="item" a:for-index="item_i1" class="_div {{d}}">` +
            `<template name="${slot1}"></template>` +
            `<template is="{{ s_default || '${slot1}' }}" data="{{ ...$root[ c ], $root, _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1), _c: c }}"/>` +
          `</view>` +
        `</view>`
      ),
      options
    )
  })

  it('slot with v-for', () => {
    const slot1 = slotName('default')
    assertCodegen(
      (
        `<div>` +
          `<slot v-for="item in list"></slot>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template name="${slot1}"></template>` +
          `<template is="{{ s_default || '${slot1}' }}" data="{{ ...$root[ c ], $root, _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1), _c: c }}" a:for="{{ h[ 2 ].li }}" a:for-item="item" a:for-index="item_i1"/>` +
        `</view>`
      ),
      options
    )
  })

  it('slot-scope inside v-for', () => {
    const slot1 = slotName('default')
    assertCodegen(
      (
        `<div>` +
          `<div v-for="item in list">` +
            `<slot :item="item"></slot>` +
          `</div>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<view a:for="{{ h[ 2 ].li }}" a:for-item="item" a:for-index="item_i1" class="_div {{d}}">` +
            `<template name="${slot1}"></template>` +
            `<template is="{{ s_default || '${slot1}' }}" data="{{ ...$root[ c ], $root, _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1), _c: c }}"/>` +
          `</view>` +
        `</view>`
      ),
      options
    )
  })

  it('slot-scope with v-for', () => {
    const slot1 = slotName('default')
    assertCodegen(
      (
        `<div>` +
          `<slot v-for="item in list" :item="item"></slot>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template name="${slot1}"></template>` +
          `<template is="{{ s_default || '${slot1}' }}" data="{{ ...$root[ c ], $root, _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1), _c: c }}" a:for="{{ h[ 2 ].li }}" a:for-item="item" a:for-index="item_i1"/>` +
        `</view>`
      ),
      options
    )
  })

  it('define slot snippet with v-for', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<span v-for="item in list" >{{ item.a }}</span>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        res.slots.forEach((slot, index) => {
          expect(slot.name).toEqual('default')
          expect(slot.body).toEqual(
            `<template name="${slot.slotName}" parent="${options.name}">` +
              `<label a:for="{{ s[ 4 + (_t || '') ].li }}" a:for-item="item" a:for-index="item_i1" class="_span {{d}}">` +
                `{{ s[ 5 + _t + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ].t }}` +
              `</label>` +
            `</template>`
          )
        })
      }
    )
  })

  it('define slot snippet with v-for', () => {
    //  slot wil be merged into ont default slot
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<span v-for="item in list" slot-scope="scope" >{{ item.a }}</span>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        res.slots.forEach((slot, index) => {
          expect(slot.name).toEqual('default')
          expect(slot.body).toEqual(
            `<template name="${slot.slotName}" parent="${options.name}">` +
              `<label a:for="{{ s[ 4 + (_t || '') ].li }}" a:for-item="item" a:for-index="item_i1" class="_span {{d}}">` +
                `{{ s[ 5 + _t + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ].t }}` +
              `</label>` +
            `</template>`
          )
        })
      }
    )
  })

  it('define component and slot inside v-for', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<template v-for="item in list">` +
            `<CompA>` +
              `<span>{{ item.a }}</span>` +
            `</CompA>` +
          `</template>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<block a:for="{{ h[ 2 ].li }}" a:for-item="item" a:for-index="item_i1">` +
            `<template is="${CompA.name}"` +
              ` data="{{ ...$root[ cp + 0 + (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ], $root, s_default: '${slot1}', _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) }}"` +
            ` />` +
          `</block>` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        res.slots.forEach((slot, index) => {
          expect(slot.name).toEqual('default')
          expect(slot.body).toEqual(
            `<template name="${slot.slotName}" parent="${options.name}">` +
              `<label class="_span {{d}}">` +
                `{{ s[ 6 + _t ].t }}` +
              `</label>` +
            `</template>`
          )
        })
      }
    )
  })

  it('define component and scoped slot inside v-for', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<template v-for="item in list">` +
            `<CompA>` +
              `<span slot-scope="scope">{{ scope.info.name }} + {{ item.a }}</span>` +
            `</CompA>` +
          `</template>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<block a:for="{{ h[ 2 ].li }}" a:for-item="item" a:for-index="item_i1">` +
            `<template is="${CompA.name}"` +
              ` data="{{ ...$root[ cp + 0 + (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ], $root, s_default: '${slot1}', _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) }}"` +
            ` />` +
          `</block>` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        res.slots.forEach((slot, index) => {
          expect(slot.name).toEqual('default')
          expect(slot.body).toEqual(
            `<template name="${slot.slotName}" parent="${options.name}">` +
              `<label class="_span {{d}}">` +
                `{{ s[ 6 + _t ].t }}` +
              `</label>` +
            `</template>`
          )
        })
      }
    )
  })

  it('define component and scoped slot with v-for inside v-for (mixed)', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<template v-for="item in list">` +
            `<CompA>` +
              `<span v-for="item in list" >{{ scope.info.name }} + {{ item.a }}</span>` +
            `</CompA>` +
          `</template>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<block a:for="{{ h[ 2 ].li }}" a:for-item="item" a:for-index="item_i1">` +
            `<template is="${CompA.name}"` +
              ` data="{{ ...$root[ cp + 0 + (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ], $root, s_default: '${slot1}', _t: (_t || '') + '-' + (item_i2 !== undefined ? item_i2 : item_i1) }}"` +
            ` />` +
          `</block>` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        res.slots.forEach((slot, index) => {
          expect(slot.name).toEqual('default')
          expect(slot.body).toEqual(
            `<template name="${slot.slotName}" parent="${options.name}">` +
              `<label a:for="{{ s[ 5 + (_t || '') ].li }}" a:for-item="item" a:for-index="item_i1" class="_span {{d}}">` +
                `{{ s[ 6 + _t + '-' + (item_i2 !== undefined ? item_i2 : item_i1) ].t }}` +
              `</label>` +
            `</template>`
          )
        })
      }
    )
  })

  it('define slot snippet with v-on', () => {
    //  slot wil be merged into ont default slot
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<span @click="onClick">click</span>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      options,
      function aasertRes (res) {
        res.slots.forEach((slot, index) => {
          expect(slot.name).toEqual('default')
          expect(slot.body).toEqual(
            `<template name="${slot.slotName}" parent="${options.name}">` +
              `<label class="_span {{d}}" data-cid="{{ _c || c }}" data-hid="{{ 4 + _t }}" onTap="_pe">` +
                `click` +
              `</label>` +
            `</template>`
          )
        })
      }
    )
  })

  it('named slot in native component - div', () => {
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<div slot="head">` +
              `<div>{{ title }}</div>` +
            `</div>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<CompA class="_CompA {{d}}">` +
            `<view class="_div {{d}}" slot="head">` +
              `<view class="_div {{d}}">{{ h[ 5 ].t }}</view>` +
            `</view>` +
          `</CompA>` +
        `</view>`
      )
    )
  })

  it('binding named slot in native component - span', () => {
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<span :slot="head">` +
              `{{ title }}` +
            `</template>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<CompA class="_CompA {{d}}">` +
            `<label class="_span {{d}}" slot="{{ h[ 3 ].slot }}">` +
              `{{ h[ 4 ].t }}` +
            `</label>` +
          `</CompA>` +
        `</view>`
      )
    )
  })

  it('v-text', () => {
    assertCodegen(
      `<div v-text="title"></div>`,
      `<view class="_div {{d}}">{{ h[ 1 ].vt }}</view>`,
    )

    assertCodegen(
      `<div v-text="title">{{ notShow }}<div>{{ notShow }}</div>{{ notShow }}</div>`,
      `<view class="_div {{d}}">{{ h[ 1 ].vt }}</view>`,
    )
  })

  it('support kebab-case tag for component in slot when register component with CapicalCase', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<comp-b></comp-b>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      // options
      {
        name: 'App$1234',
        imports: {
          CompA,
          CompB
        }
      },
      // assert output.slots
      function assertRes (res) {
        res.slots.forEach(slot => {
          if (slot.name === 'default') {
            expect(slot.dependencies[0]).toBe('CompB$1234')
            expect(slot.body).toContain(`<template is="CompB$1234" data="{{ ...$root[ cp + 1 + (_t || '') ], $root, _t: _t || '' }}" />`)
          }
        })
      }
    )
  })

  it('support kebab-case tag for component in slot when register component with camelCase', () => {
    const slot1 = slotName('default').replace('$', '_')
    assertCodegen(
      (
        `<div>` +
          `<CompA>` +
            `<comp-b></comp-b>` +
          `</CompA>` +
        `</div>`
      ),
      (
        `<view class="_div {{d}}">` +
          `<template is="${CompA.name}" data="{{ ...$root[ cp + 0 + (_t || '') ], $root, s_default: '${slot1}', _t: _t || '' }}" />` +
        `</view>`
      ),
      // options
      {
        name: 'App$1234',
        imports: {
          CompA,
          compB: CompB
        }
      },
      // assert output.slots
      function assertRes (res) {
        res.slots.forEach(slot => {
          if (slot.name === 'default') {
            expect(slot.dependencies[0]).toBe('CompB$1234')
            expect(slot.body).toContain(`<template is="CompB$1234" data="{{ ...$root[ cp + 1 + (_t || '') ], $root, _t: _t || '' }}" />`)
          }
        })
      }
    )
  })
})
