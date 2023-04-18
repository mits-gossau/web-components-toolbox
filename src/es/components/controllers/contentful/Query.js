const QUERY = `
query GetNews($limit: Int!, $skip: Int!) {
  newsEntryCollection(order: date_DESC, locale: "de-DE", skip: $skip, limit: $limit, where: {tags_contains_some: "Hitzberger"}) {
    total
    skip
    limit
    items {
      slug
      date
      location
      introHeadline
      introText
      introImage {
        ...AssetProps
      }
      contentOne {
        json
      }
      imageOne {
        ...AssetProps
      }
      contentTwo {
        json
      }
      imageTwo {
        ...AssetProps
      }
      contentThree {
        json
      }
      imageThree {
        ...AssetProps
      }
      contentFour {
        json
      }
      imageFour {
        ...AssetProps
      }
      linkListCollection(limit: 15) {
        items {
          linkText
          linkUrl
          downloadItem {
            ...AssetProps
            fileName
            size
          }
        }
      }
      cooperative
      testwinner
      metaTitle
      metaDescription
      metaKeywords
      tags
    }
  }
}

fragment AssetProps on Asset {
  title
  description
  url
}
`
export default QUERY
