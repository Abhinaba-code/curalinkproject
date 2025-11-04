import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import type { Publication } from '@/lib/types';

const PUBMED_API_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const extractTextFromNode = (node: any): string => {
    if (typeof node === 'string') {
      return node;
    }
    if (typeof node === 'object' && node !== null) {
      if ('#text' in node) {
        let text = node['#text'];
        for (const key in node) {
          if (key !== '#text' && typeof node[key] === 'string') {
            text += ` ${node[key]}`;
          }
        }
        return text;
      }
      return Object.values(node).flat().map(extractTextFromNode).join('');
    }
    return '';
};

const formatPublication = (articleData: any): Publication | null => {
    try {
        const pmidNode = articleData.MedlineCitation.PMID;
        const pmid = typeof pmidNode === 'object' ? pmidNode['#text'] : pmidNode;
        if (!pmid) return null;
        
        const article = articleData.MedlineCitation.Article;

        let abstract = 'No abstract available.';
        if (article.Abstract?.AbstractText) {
            if (Array.isArray(article.Abstract.AbstractText)) {
            abstract = article.Abstract.AbstractText.map(extractTextFromNode).join(' ');
            } else {
            abstract = extractTextFromNode(article.Abstract.AbstractText);
            }
        }
        
        const doi = article.ELocationID?.find((id: any) => id.EIdType === 'doi')?.['#text'] || '';

        const authors = article.AuthorList?.Author;
        const authorNames = Array.isArray(authors)
            ? authors.map(author => `${author.ForeName} ${author.LastName}`)
            : authors ? [`${authors.ForeName} ${authors.LastName}`] : [];

        const title = extractTextFromNode(article.ArticleTitle) || 'No title available.';

        const year = article.Journal?.JournalIssue?.PubDate?.Year ? 
                     parseInt(article.Journal.JournalIssue.PubDate.Year, 10) : 
                     (article.ArticleDate?.Year ? parseInt(article.ArticleDate.Year, 10) : 'N/A');

        return {
            id: pmid.toString(),
            title: title,
            authors: authorNames,
            journal: article.Journal?.Title || 'N/A',
            year: year,
            doi: doi,
            abstract: abstract, 
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
        };
    } catch (e) {
        console.error("Error formatting publication:", e);
        return null;
    }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const pageSize = searchParams.get('pageSize') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const searchResponse = await fetch(
      `${PUBMED_API_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${pageSize}&retmode=json`,
      { cache: 'no-store' }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      return NextResponse.json({ error: `PubMed search API error: ${errorText}` }, { status: searchResponse.status });
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
        return NextResponse.json({ results: [] });
    }

    const ids = searchData.esearchresult.idlist;

    const fetchResponse = await fetch(
      `${PUBMED_API_BASE_URL}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`,
      { cache: 'no-store' }
    );

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      return NextResponse.json({ error: `PubMed fetch API error: ${errorText}` }, { status: fetchResponse.status });
    }
    const xmlData = await fetchResponse.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
      parseAttributeValue: true,
      isArray: (name) => ['Author', 'AbstractText', 'ELocationID'].includes(name),
      tagValueProcessor: (tagName, tagValue) => {
        if (tagName === 'PMID' || tagName === 'Year') {
          return String(tagValue);
        }
        return;
      },
    });
    const jsonData = parser.parse(xmlData);

    if (!jsonData.PubmedArticleSet?.PubmedArticle) {
      return NextResponse.json({ results: [] });
    }

    const articles = Array.isArray(jsonData.PubmedArticleSet.PubmedArticle)
      ? jsonData.PubmedArticleSet.PubmedArticle
      : [jsonData.PubmedArticleSet.PubmedArticle];

    const formattedResults = articles
        .map(formatPublication)
        .filter((p): p is Publication => p !== null);

    return NextResponse.json({ results: formattedResults });

  } catch (error) {
    console.error('Error in PubMed proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
