// const QUERY = `query GetNews($limit: Int, $skip: Int) {
//   newsEntryCollection(
//     order: date_DESC,
//     locale: "de-DE",
//     limit: $limit,
//     skip: $skip,
//     where: {tags_contains_some: "Hitzberger" }
//     ){
//     items {
//       slug
//       date
//       location
//       cooperative
//       testwinner
//       title
//       description
//       keywords
//       intro{
//         json
//       }
//       content{
//         json
//       }
//     tags
//       intro {
//         json
//       }
//     }
//   }
// }`
// const QUERY = `query GetNews($limit: Int!, $skip: Int!) {
//   newsEntryCollection(order: date_DESC, locale: "de-DE", skip: $skip, limit: $limit, where: { tags_contains_some: "Hitzberger" }) {
//     total
//     skip
//     limit
//     items {
//       slug
//       date
//       location
//       cooperative
//       testwinner
//       title
//       description
//       keywords
//       intro {
//         json
//       },
//       introImage{
//         url(transform:{width:300, height:300, format:WEBP})
//         description
//       },
//       content {
//         json
//       }
//       tags
//     }
//   }
// }`

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
