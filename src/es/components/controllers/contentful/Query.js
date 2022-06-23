const QUERY = `query GetNews($limit: Int!) {
  newsEntryCollection(
    order: date_DESC,
    locale: "de-DE",
    limit: $limit,
    where: {tags_contains_some: "Hitzberger" }  
    ){
    items {
      slug
      date
      location
      cooperative
      testwinner
      title
      description
      keywords
      intro{
        json
      }
      content{
        json
      }
    tags
      intro {
        json
      }
    }
  }
}`
export default QUERY