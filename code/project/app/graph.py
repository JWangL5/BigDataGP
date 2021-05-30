import json
import logging
import requests
from tqdm import tqdm
from lxml import etree
from bs4 import BeautifulSoup


def get_pmcid_from_esearch(keyword, retmax=4000, sortby='relevance'):
    e_utilities = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&RetMax={retmax}&sort={sortby}&term={keyword}'
    requests.packages.urllib3.disable_warnings()
    keyword_get = requests.get(e_utilities)
    keyword_xml = etree.XML(keyword_get.text.encode('utf8'))
    pmc_ids = [i.text for i in keyword_xml.find('IdList')]
    logging.info("Get pmcid from esearch")
    return pmc_ids


def get_info_by_pmcid_from_efetch(pmc_ids, cite=False):
    n = 200
    pmcid_batch = [pmc_ids[i:i+n] for i in range(0,len(pmc_ids),n)]
    result, cite_pmids = [], []
    for i in tqdm(pmcid_batch, desc="Original Papers"):
        ids = ",".join(i)
        e_utilities = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id={ids}'
        pmcids_get = requests.get(e_utilities)
        pmcids_xml = etree.XML(pmcids_get.text.encode('utf8'))
        
        for article in pmcids_xml.getchildren():
            givenname = article.xpath('./front//contrib-group/contrib[@contrib-type="author"]/name/given-names/text()')
            surname = article.xpath('./front//contrib-group/contrib[@contrib-type="author"]/name/surname/text()')
            surname_abb = ["".join([i[0] for i in x.split(' ')]) for x in surname]
            if len(givenname) != len(surname):
            	continue
            pubyear, pubmonth, pubday = '','',''
            try:
                pubyear = article.xpath('./front//pub-date/year/text()')[0]
                pubmonth = article.xpath('./front//pub-date/month/text()')[0]
                pubday = article.xpath('./front//pub-date/day/text()')[0]
            except:
                pass
            
            if cite:
                try:
                    citation = article.xpath('./back//ref-list//pub-id[@pub-id-type="pmid"]/text()')
                    cite_pmids += citation
                except:
                    pass
            else:
                citation = []
            
            try:
                article_dict = {'journal':article.xpath('./front//journal-title/text()')[0]
                ,'pmcid':article.xpath('./front//article-id[@pub-id-type="pmc"]/text()')[0]
                ,'pmid':article.xpath('./front//article-id[@pub-id-type="pmid"]/text()')[0] 
                ,'doi':article.xpath('./front//article-id[@pub-id-type="doi"]/text()')[0]
                ,'kind':article.xpath('./front//subj-group/subject/text()')[0]
                ,'title':article.xpath('./front//title-group/article-title/text()')[0]
                ,'author':[givenname[i]+' '+surname_abb[i] for i in range(len(givenname))]
                ,'pubdate':f'{pubyear}-{pubmonth}-{pubday}'
                ,'abstract':'\n'.join(article.xpath('./front//abstract/p/text()'))
                ,'citation':citation}
                result.append(article_dict)
            except:
                continue
    
    if cite:
        logging.info("Get info by citation pmcid from efetch")
        return result, cite_pmids
    else:
        logging.info("Get info by pmcid from efetch")
        return result


def get_info_by_pmid_from_efetch(pmids):
    n = 200
    pmid_batch = [pmids[i:i+n] for i in range(0,len(pmids),n)]
    docinfo = []
    for i in tqdm(pmid_batch, desc="Reference Papers"):
        ids = ",".join(i)
        e_utilities = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={ids}&retmode=xml'
        pmsummary_get = requests.get(e_utilities)
        pmsummary_xml = etree.XML(pmsummary_get.text.encode('utf8'))
        
        for doc in pmsummary_xml.getchildren():
            pubyear = doc.xpath('.//PubmedData/History/PubMedPubDate[@PubStatus="pubmed"]/Year/text()')[0]
            pubmonth = doc.xpath('.//PubmedData/History/PubMedPubDate[@PubStatus="pubmed"]/Month/text()')[0]
            pubday = doc.xpath('.//PubmedData/History/PubMedPubDate[@PubStatus="pubmed"]/Day/text()')[0]
            pubmed, doi, pmc = "", "", ""
            try:
                pubmed = doc.xpath('.//PubmedData/ArticleIdList/ArticleId[@IdType="pubmed"]/text()')[0]
                doi = doc.xpath('.//PubmedData/ArticleIdList/ArticleId[@IdType="doi"]/text()')[0]
                pmc = doc.xpath('.//PubmedData/ArticleIdList/ArticleId[@IdType="pmc"]/text()')[0][3:]
            except:
                pass

            try:
	            LastName = doc.xpath('.//Article/AuthorList/Author/LastName/text()')
	            ForeName = doc.xpath('.//Article/AuthorList/Author/ForeName/text()')
	            ForeName_abb = ["".join([i[0] for i in x.split(' ')]) for x in ForeName]
	            if len(LastName) != len(ForeName):
            		continue
            except Exception as e:
            	continue

            try:
            	article_dict = {'journal':doc.xpath('.//Article/Journal/Title/text()')[0]
	                ,'pmcid':pmc, 'pmid':pubmed, 'doi':doi
	                ,'kind':doc.xpath('.//Article/PublicationTypeList/PublicationType/text()')[0]
	                ,'title':doc.xpath('.//Article/ArticleTitle/text()')[0]
	                ,'author':[LastName[i]+' '+ForeName_abb[i] for i in range(len(LastName))]
	                ,'pubdate':f'{pubyear}-{pubmonth}-{pubday}'
	                ,'abstract':doc.xpath('.//Article/Abstract/AbstractText/text()')
	                ,'citation':[]}
            except Exception as e:
            	continue
            docinfo.append(article_dict)
    return docinfo


def find_or_create_author(tx, author_name):
    match_query = ("MATCH (m:Author{name: $author_name}) RETURN m")
    try:
        match_result = tx.run(match_query, author_name=author_name)
    except:
        logging.error(f"match author for {author_name}")
        return False
    result = [row for row in match_result]
    
    if result == []:
        create_query = ("CREATE (m:Author{name: $author_name})")
        try:
            tx.run(create_query, author_name=author_name)
        except:
            logging.error(f"create author for {author_name}")
            return False
    return True


def find_or_create_paper(tx, docsum, keyword):
    match_query = ("MATCH (m:Paper {pubmed: $pmid}) RETURN m")
    try:
        match_result = tx.run(match_query, pmid=docsum['pmid'])
    except:
        logging.error(f"Failed to match paper for Pubmed {docsum['pmid']}")
        return False
    result = [row for row in match_result]

    if result == []:
        create_query = (
            "CREATE (m :Paper {title: $title , journal: $journal , pubdate: $pubdate , doi: $doi , pmcid: $pmcid , pubmed: $pmid , kind: $kind, abstract: $abstract })"
            f"SET m: {keyword}"
        )
        try:
            tx.run(create_query, title=docsum['title'], journal=docsum['journal'], pubdate=docsum['pubdate'], doi=docsum['doi'], pmcid=docsum['pmcid'], pmid=docsum['pmid'], kind=docsum['kind'], abstract=docsum['abstract'])
        except:
            logging.error(f"Failed to create paper for Pubmed {docsum['pmid']}")
            return False
    else:
        create_query = (
            "MATCH (m:Paper {pubmed: $pmid })"
            f"SET m: {keyword}"
        )
        try:
            tx.run(create_query, pmid=docsum['pmid'])
        except:
            logging.error(f"Failed to add another paper label {keyword} to Pubmed {docsum['pmid']}")
            return "repeat"
    return True


def find_or_create_publish(tx, pmid, author, order):
    match_query = ("MATCH (a:Author {name: $author}) -[r:PUBLISH]-> (p:Paper {pubmed: $pmid}) RETURN r")
    match_result = [row for row in tx.run(match_query, author=author, pmid=str(pmid))]
    if not match_result:
        connect_query = (
            "MATCH (a:Author {name: $author}) "
            "MATCH (p:Paper {pubmed: $pmid}) "
            "CREATE (a) -[r:PUBLISH {order: $order }]-> (p)"
        )
        try:
            connect_result = tx.run(connect_query, author=author, pmid=str(pmid), order=order)
        except:
            logging.error(f"create publish relationship between {author_name} and Pubmed {pmid}")
            return False
    return True


def find_or_create_cite(tx, pmid, ref_pmid):
    match_query = ("MATCH (p1:Paper {pubmed: $pmid}) -[r:CITE]-> (p2:Paper {pubmed: $ref_pmid}) RETURN r")
    match_result = [row for row in tx.run(match_query, pmid=str(pmid), ref_pmid=str(ref_pmid))]
    x1 = tx.run("MATCH (p1:Paper {pmid: $pmid}) RETURN p1", pmid=pmid)
    x2 = tx.run("MATCH (p2:Paper {pmid: $ref_pmid}) RETURN p2", ref_pmid=ref_pmid)
    
    if not match_result and x1 and x2:
        connect_query = (
            "MATCH (p1:Paper {pubmed: $pmid}) "
            "MATCH (p2:Paper {pubmed: $ref_pmid}) "
            "CREATE (p1) -[r:CITE]-> (p2)"
        )
        try:
            tx.run(connect_query, pmid=str(pmid), ref_pmid=str(ref_pmid))
        except:
            logging.error(f"Failed to create cite relationship between {pmid} and {ref_pmid}.")
            return False
    return True


def get_data_from_ncbi(keyword,retmax=10):
    pmcid = get_pmcid_from_esearch(keyword, retmax=retmax)
    pmc_fetch, citation_pmid = get_info_by_pmcid_from_efetch(pmcid, cite=True)
    pmid_fetch = [i['pmid'] for i in pmc_fetch]
    citation_pmid = list(set(citation_pmid) - set(pmid_fetch))
    pm_fetch_cite = get_info_by_pmid_from_efetch(citation_pmid)
    papers = pmc_fetch+pm_fetch_cite
    author_lst = [a for al in [i['author'] for i in papers] for a in al]
    authors = list(set(author_lst))
    return authors, papers


def warehouse(driver, keyword, retmax=100):
    authors, papers = get_data_from_ncbi(keyword, retmax=retmax)
    with driver.session() as s:
        for a in tqdm(authors, desc='Authors'):
            s.write_transaction(find_or_create_author, a)
        for p in tqdm(papers, desc='Papers'):
            flag = s.write_transaction(find_or_create_paper, p, keyword)
        for p in tqdm(papers, desc='Relationship'):
            for order, a in enumerate(p['author']):
                s.write_transaction(find_or_create_publish, p['pmid'], a, order+1)
            for j in p['citation']:
                s.write_transaction(find_or_create_cite, p['pmid'], j)
    return True

