<template>
  <div>
    <h2>Dashboard</h2>

    <p>Name: {{ user.name }}</p>
  </div>
</template>

<script>
import axios from 'axios'
import router from '../router'
export default {
  name: 'Dashboard',
  data () {
    return {
      user: {
        name: 'Jesse'
      }
    }
  },
  methods: {
    getUserData: function () {
      let self = this
      axios
        .get('/api/user')
        .then((res) => {
          console.log(res.data)
          self.$set(this, 'user', res.data.user)
        })
        .catch((err) => {
          console.log(err)
          router.push('/')
        })
    }
  },
  mounted () {
    this.getUserData()
  }
}
</script>
