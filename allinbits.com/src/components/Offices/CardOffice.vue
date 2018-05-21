<template>
<div class="card-offices">
  <div class="flexlist" v-for="i in offices">
    <div class="img-box">
      <img :src="image('offices', i.slug)">
    </div>
    <div class="text">
      <div class="title">{{i.title}}</div>
      <div class="subTitle">{{i.subTitle}}</div>
      <div class="address">{{i.address}}</div>
    </div>
  </div>
</div>
</template>

<script>
import { image } from '../../scripts/cdn.js'
export default {
  name: 'card-offices',
  data: () => ({ image: image }),
  props: ['offices']
}
</script>

<style lang="stylus">
  @require '../../styles/variables.styl'
  .card-offices
    margin-left 20vw
    overflow hidden
    margin-top 8vh
    .flexlist
      margin-bottom 8vh
      width 100%
      overflow hidden
      .img-box
        float left
        width 110px
        img
          width 110px
          height 110px
      .text
        width: 290px;
        float left
        margin-left 2vw
        .title
          font-size 20px;
          font-weight bold;
          color txt;
        .subTitle
          color dim;
          font-weight bold;
          padding-top 24px;
          font-size 16px;
        .address
          padding-top 2px;
          font-size 16px;
          font-weight normal;
          color light;

  @media screen  and (max-width: 768px)
    .card-offices
      margin-left 8vw
      margin-top 2vh
    .flexlist
      margin-top 4vh !important
      .text
        .subTitle
          padding-top 2px !important
</style>
