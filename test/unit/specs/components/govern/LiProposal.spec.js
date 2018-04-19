import { shallow } from "@vue/test-utils"
import LiProposal from "renderer/components/govern/LiProposal"

describe("LiProposal", () => {
  let wrapper
  let propsData = {
    proposal: {
      id: "d93bf0eu",
      createdAt: 1493627091000,
      validatorId: "serena-korgan",
      title:
        "An dixit, nitido! Qui ab plangi, frustraque lanam, credunt nec postquam",
      type: "text",
      flags: {
        passed: false
      },
      data: {
        text:
          "Pennis deserto, per agunt quibus unde, formae pennis nobis primus. Scabrae tu secuti certans, meos tum aera primaque, **inane cerae tenetis** fallere, suis ad ne, incepto? Patulos illis versus. Unam ait census et nullaque *teneat*, laceraret [adiere pendentibus](http://arbor.com/achillis.aspx). [Repulsae](http://et.io/aevi.php) dicere: teneri, in tenent erubuisse iuncti, natant paterni, in **infringat Berecyntius** quae, abolere faveatque."
      },
      votes: {
        yes: 55,
        no: 24,
        reject: 10,
        abstain: 11
      }
    }
  }

  beforeEach(() => {
    wrapper = shallow(LiProposal, { propsData })
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
