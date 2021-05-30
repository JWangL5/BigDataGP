from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.db.models import Count
from .graph import warehouse
from neo4j import GraphDatabase
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from pyecharts import options as opts
from pyecharts.charts import WordCloud
import re


# Create your views here.
from .models import Paper


def index(request):
	return render(request, 'index.html')


def result(request):
	keyword = request.GET.get('keyword')
	keyword = ''.join([i.lower().capitalize() for i in re.sub(r'[ ]+', ' ', keyword).split(' ')])
	g = GraphDatabase.driver('neo4j://localhost:7687', auth=('neo4j', 'JWangL5@cau'))
	
	with g.session() as session:
		res = session.run("CALL db.labels")
		labels = [row['label'] for row in res]
	if keyword not in labels:
		warehouse(g, keyword, 300)

	data = get_pagerank(g, keyword)
	wc = get_wordcloud(data, keyword).render_embed()
	return render(request, 'temp.html', {'keyword':keyword, 'prpapers':data, 'mywordcloud':wc})


def get_pagerank(driver, keyword):
	with driver.session() as session:
	    res = session.run(f"CALL gds.graph.exists('{keyword}')")
	    if not [row['exists'] for row in res][0]:
	        session.run(f"CALL gds.graph.create('{keyword}','{keyword}','CITE')")
	    pr_query = (
	        f'''CALL gds.pageRank.stream('{keyword}') YIELD nodeId, score 
	        	SET gds.util.asNode(nodeId).pagerank = score
	        	RETURN gds.util.asNode(nodeId) AS node, score ORDER BY score DESC LIMIT 100'''
	    )
	    result = session.run(pr_query)
	    dataframe = []
	    for row in result:
	        x = dict(row['node'])
	        x['pr'] = f'{row["score"]:8.3f}'
	        dataframe.append(x)
	    return dataframe


def wordfreq(abstract):
    j = ["".join(i) for i in abstract]
    txt = " ".join([k.lower() for k in j])
    for ch in '!"#$&()*+,-./:;<=>?@[\\]^_{|}·~‘’':
        txt = txt.replace(ch,"")
    stop = set(stopwords.words('english'))
    wnl = WordNetLemmatizer()
    filtered= [wnl.lemmatize(w) for w in txt.split() if w not in stopwords.words('english')]
    
    counts = {}
    for word in set(filtered):
        counts[word] = filtered.count(word)
    
    for i in list(counts.keys()):
        if re.match(r'^\d.*?', i):
            del(counts[i])
    return sorted(counts.items(), key=lambda item:item[1], reverse=True)


def get_wordcloud(prdata, keyword):
    abstract = [i['abstract'] for i in prdata]
    data = wordfreq(abstract)
    wc = WordCloud()
    wc.add(series_name=f"{keyword}", data_pair=data, word_size_range=[6, 66])
    wc.set_global_opts(
            title_opts=opts.TitleOpts(title=f"{keyword}", title_textstyle_opts=opts.TextStyleOpts(font_size=23)),
            tooltip_opts=opts.TooltipOpts(is_show=True),
        )
    return wc

